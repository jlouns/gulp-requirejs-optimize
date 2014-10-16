'use strict';

require('should');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var requirejsOptimize = require('../');

var getFile = function(filepath) {
	return new gutil.File({
		base: path.dirname(filepath),
		path: filepath,
		cwd: './test/',
		contents: fs.readFileSync(filepath)
	});
};

var fixture = function(filepath) {
	return getFile(path.join('test', 'fixtures', filepath));
};

var expected = function(filepath) {
	return getFile(path.join('test', 'expected', filepath));
};

var constructBuffer = function(stream) {
	var buffer = [];

	stream.on('data', function(file) {
		buffer.push(file);
	});

	return buffer;
};

var compare = function(actual, expected) {
	String(actual.contents).should.equal(String(expected.contents));
};

var testStream = function(stream, fixtureName, expectedName, done) {
	var buffer = constructBuffer(stream);

	stream.on('end', function() {
		buffer.should.have.length(1);

		var output = buffer[0];

		output.relative.should.equal(expectedName);
		compare(output, expected(expectedName));

		done();
	});

	stream.write(fixture(fixtureName));

	stream.end();
};

describe('gulp-requirejs-optimize', function() {

	describe('requirejsOptimize', function() {
		it('should accept no options', function (done) {
			var stream = requirejsOptimize();

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept options object', function(done) {
			var stream = requirejsOptimize({ });

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept options function', function(done) {
			var stream = requirejsOptimize(function() {
				return { };
			});

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept out filename', function(done) {
			var outpath = 'different/path/out.js';

			var stream = requirejsOptimize({
				out: outpath
			});

			var buffer = constructBuffer(stream);

			stream.on('end', function() {
				try {
					buffer.should.have.length(1);

					var output = buffer[0];

					output.relative.should.equal(outpath);
					compare(output, expected('main.js'));

					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(fixture('main.js'));

			stream.end();
		});

		it('should not accept out function', function(done) {
			var stream = requirejsOptimize({
				out: function() { }
			});

			stream.on('error', function (err) {
				try {
					err.message.should.equal('If `out` is supplied, it must be a string');
					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(fixture('main.js'));
		});

		it('should emit errors from requirejs', function(done) {
			var stream = requirejsOptimize();

			stream.on('error', function () {
				done();
			});

			stream.write(fixture('error.js'));
		});

		it('should optimize multiple files', function(done) {
			var stream = requirejsOptimize();

			var count = 0;

			var filenames = ['one.js', 'two.js', 'three.js'];

			stream.on('data', function(file) {
				try {
					count++;
					filenames.should.containEql(file.relative);
					compare(file, expected(file.relative));

					if(count === 2) {
						done();
					}
				} catch (err) {
					done(err);
				}
			});

			filenames.forEach(function(filename) {
				stream.write(fixture(filename));
			});
		});
	});
});
