'use strict';

var defaults = require('lodash.defaults');
var gutil = require('gulp-util');
var path = require('path');
var through = require('through2');
var requirejs = require('requirejs');
var chalk = require('chalk');
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
				gutil.log(chalk.red(msg));
			} else {
				gutil.log(msg);
			}
		};
	});

	options = options || {};

	var generateOptions;
	if (typeof options !== 'function') {
		generateOptions = function() {
			return options;
		};
	} else {
		generateOptions = options;
	}

	var error;

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return;
		}

		var optimizeOptions = generateOptions(file);
		if (typeof optimizeOptions !== 'object') {
			cb(new gutil.PluginError(PLUGIN_NAME, 'Options function must produce an options object'));
			return;
		}

		optimizeOptions = defaults({}, optimizeOptions, {
			logLevel: 2,
			baseUrl: file.base,
			out: file.relative,
			generateSourceMaps: !!file.sourceMap
		});

		if (optimizeOptions.generateSourceMaps) {
			defaults(optimizeOptions, {
				preserveLicenseComments: false,
				optimize: 'uglify2'
			});
		}

		if (!optimizeOptions.include && !optimizeOptions.name) {
			optimizeOptions.include = pathToModuleId(file.relative);
		}

		if (typeof optimizeOptions.out !== 'string') {
			cb(new gutil.PluginError(PLUGIN_NAME, 'If `out` is supplied, it must be a string'));
			return;
		}

		var out = optimizeOptions.out;
		optimizeOptions.out = function(text, sourceMapText) {
			var file = new gutil.File({
				path: out,
				contents: new Buffer(text)
			});

			if (sourceMapText) {
				applySourceMap(file, sourceMapText);
			}

			cb(null, file);
		};

		var target;
		if (optimizeOptions.logLevel < 2) {
			target = path.resolve(file.path);
		} else {
			target = file.relative;
		}
		
		gutil.log('Optimizing ' + chalk.magenta(target));
		requirejs.optimize(optimizeOptions, null, function(err) {
			error = err;
			cb();
		});
	}, function(cb) {
		if (error) {
			cb(new gutil.PluginError(PLUGIN_NAME, error));
		}

		cb();
	});
};
