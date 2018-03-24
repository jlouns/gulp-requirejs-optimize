'use strict';

var path = require('path');

var defaults = require('lodash.defaults');
var through = require('through2');
var requirejs = require('requirejs');
var chalk = require('chalk');
var Vinyl = require('vinyl');
var log = require('fancy-log');
var PluginError = require('plugin-error');
var applySourceMap = require('vinyl-sourcemaps-apply');

var PLUGIN_NAME = 'gulp-requirejs-optimize';

function pathToModuleId(path) {
	// replace Windows path separators to make sure this is a valid module ID
	path = path.replace(/\\/g, '/');

	// remove the file extension if this is a .js file
	var filenameEndIndex = path.length - 3;
	var extensionIndex = path.indexOf('.js', filenameEndIndex);
	if (extensionIndex !== -1 && extensionIndex === filenameEndIndex) {
		path = path.substring(0, filenameEndIndex);
	}

	return path;
}

module.exports = function(options) {
	requirejs.define('node/print', [], function() {
		return function(msg) {
			if (msg.substring(0, 5) === 'Error') {
				log(chalk.red(msg));
			} else {
				log(msg);
			}
		};
	});

	options = options || {};

	var generateOptions;
	if (typeof options === 'function') {
		generateOptions = options;
	} else {
		generateOptions = function() {
			return options;
		};
	}

	var error;

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		var optimizeOptions = generateOptions(file);
		if (typeof optimizeOptions !== 'object') {
			cb(new PluginError(PLUGIN_NAME, 'Options function must produce an options object'));
			return;
		}

		var sourceMapPresent = Boolean(file.sourceMap);
		var logLevelPresent = Boolean(optimizeOptions.logLevel);

		optimizeOptions = defaults({}, optimizeOptions, {
			logLevel: 2,
			baseUrl: file.base,
			out: file.relative,
			generateSourceMaps: sourceMapPresent
		});

		if (optimizeOptions.generateSourceMaps) {
			defaults(optimizeOptions, {
				preserveLicenseComments: false
			});
		}

		if (!optimizeOptions.include && !optimizeOptions.name) {
			optimizeOptions.include = pathToModuleId(file.relative);
		}

		if (typeof optimizeOptions.out !== 'string') {
			cb(new PluginError(PLUGIN_NAME, 'If `out` is supplied, it must be a string'));
			return;
		}

		var out = optimizeOptions.out;
		optimizeOptions.out = function(text, sourceMapText) {
			if (sourceMapPresent) {
				// uglify adds its own sourceMappingURL comment which will get duplicated by gulp-sourcemaps
				text = text.replace(/\/\/# sourceMappingURL=.*$/, '');
			}

			var outfile = new Vinyl({
				path: out,
				contents: new Buffer(text)
			});

			if (sourceMapText) {
				applySourceMap(outfile, sourceMapText);
			}

			cb(null, outfile);
		};

		var target;
		if (optimizeOptions.logLevel < 2) {
			target = path.resolve(file.path);
		} else {
			target = file.relative;
		}

		if (!logLevelPresent || optimizeOptions.logLevel < 2) {
			log('Optimizing ' + chalk.magenta(target));
		}
		requirejs.optimize(optimizeOptions, null, function(err) {
			error = err;
			cb();
		});
	}, function(cb) {
		if (error) {
			cb(new PluginError(PLUGIN_NAME, error));
		}

		cb();
	});
};
