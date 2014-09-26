'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var requirejs = require('requirejs');
var chalk = require('chalk');

var PLUGIN_NAME = 'gulp-requirejs-optimize';

module.exports = function (options) {
	var stream;

	requirejs.define('node/print', [], function() {
		return function(msg) {
			if (msg.substring(0, 5) === 'Error') {
				stream.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
			} else {
				gutil.log(msg);
			}
		};
	});

	stream = through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			this.push(file);
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
			return cb();
		}

		try {
			options = options || {};

			if(typeof options === 'function') {
				options = options(file);
			}

			if(typeof options.baseUrl === 'undefined') {
				options.baseUrl = file.base;
			}

			if(typeof options.include === 'undefined') {
				options.include = file.relative;
			}

			if(typeof options.out === 'undefined') {
				options.out = file.relative;
			} else if(typeof options.out !== 'string') {
				this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'If `out` is supplied, it must be a string'));
				return cb();
			}

			var out = options.out;
			options.out = function(text) {
				cb(null, new gutil.File({
					path: out,
					contents: new Buffer(text)
				}));
			};

			gutil.log(file.base);
			gutil.log(file.relative);
			gutil.log(file.path);
			gutil.log(file.cwd);

			gutil.log('Tracing dependencies for ' + chalk.magenta(file.relative));

			requirejs.optimize(options, function(msg) {
				gutil.log(msg);
			});
		} catch (err) {
			this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
		}
	});

	return stream;
};
