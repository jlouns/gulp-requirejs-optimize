'use strict';

var should = require('should');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var requirejsOptimize = require('../');

var getFile = function(filePath) {
	return new gutil.File({
		base: path.dirname(filePath),
		path: filePath,
		cwd: './test/',
		contents: fs.readFileSync(filePath)
	});
};

var getFixture = function(filePath) {
	return getFile(path.join('test', 'fixtures', filePath));
};

var getExpected = function(filePath) {
	return getFile(path.join('test', 'expected', filePath));
};

var compare = function(stream, name, expectedName, done) {
	stream.on('data', function(newFile) {
		if (path.basename(newFile.path) === name) {
			should(String(getExpected(expectedName).contents)).eql(String(newFile.contents));
		}
	});

	stream.on('end', function() {
		done();
	});

	stream.write(getFixture(name));

	stream.end();
};

it('should optimize without any arguments', function (done) {
	var stream = requirejsOptimize();

	compare(stream, "main.js", "main.js", done);
});
