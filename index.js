'use strict';

var defaults = require('lodash.defaults');
var gutil = require('gulp-util');
var through = require('through2');
var requirejs = require('requirejs');
var chalk = require('chalk');

var PLUGIN_NAME = 'gulp-requirejs-optimize';

module.exports = function(options) {
	var stream;

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

	stream = through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}

		var optimizeOptions = generateOptions(file);
		if (typeof optimizeOptions !== 'object') {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Options function must produce an options object'));
		}

		optimizeOptions = defaults({}, optimizeOptions, {
			logLevel: 2,
			baseUrl: file.base,
			out: file.relative
		});

		if (!optimizeOptions.include && !optimizeOptions.name) {
			optimizeOptions.include = file.relative;
		}

		if (typeof optimizeOptions.out !== 'string') {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'If `out` is supplied, it must be a string'));
			return cb();
		}

		var out = optimizeOptions.out;
		optimizeOptions.out = function(text) {
			cb(null, new gutil.File({
				path: out,
				contents: new Buffer(text)
			}));
		};

		gutil.log('Optimizing ' + chalk.magenta(file.relative));
		requirejs.optimize(optimizeOptions, null, function(err) {
			stream.emit('error', new gutil.PluginError(PLUGIN_NAME, err.message));
		});
	});

	return stream;
};
