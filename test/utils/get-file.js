'use strict';

var fs = require('fs');
var path = require('path');

var gutil = require('gulp-util');

module.exports = function getFile(filepath) {
	return new gutil.File({
		base: path.dirname(filepath),
		path: filepath,
		cwd: './test/',
		contents: fs.readFileSync(filepath)
	});
};
