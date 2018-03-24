'use strict';

var fs = require('fs');
var path = require('path');

var Vinyl = require('vinyl');

module.exports = function getFile(filepath) {
	return new Vinyl({
		base: path.dirname(filepath),
		path: filepath,
		cwd: './test/',
		contents: fs.readFileSync(filepath)
	});
};
