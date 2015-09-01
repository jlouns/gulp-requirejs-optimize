/* jshint expr: true */
/* global describe, it */
'use strict';

var should = require('should');
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
	String(actual.contents).trim().should.equal(String(expected.contents).trim());
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
		it('should accept no options', function(done) {
			var stream = requirejsOptimize();

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept options object', function(done) {
			var stream = requirejsOptimize({
				logLevel: 1
			});

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept options function', function(done) {
			var stream = requirejsOptimize(function() {
				return { };
			});

			testStream(stream, 'main.js', 'main.js', done);
		});

		it('should accept name parameter', function(done) {
			var stream = requirejsOptimize({
				name: 'main-define'
			});

			testStream(stream, 'main-define.js', 'main-define.js', done);
		});

		it('should pass through null file', function(done) {
			var stream = requirejsOptimize();

			var buffer = constructBuffer(stream);

			stream.on('end', function() {
				try {
					buffer.should.have.length(1);

					var output = buffer[0];

					output.isNull().should.be.true;

					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(new gutil.File());

			stream.end();
		});

		it('should error on stream file', function(done) {
			var stream = requirejsOptimize();

			stream.on('error', function(err) {
				try {
					err.message.should.equal('Streaming not supported');
					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(new gutil.File({
				contents: stream
			}));
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

					output.relative.replace(/\\/g, '/').should.equal(outpath);
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

			stream.on('error', function(err) {
				try {
					err.message.should.equal('If `out` is supplied, it must be a string');
					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(fixture('main.js'));
		});

		it('should error on invalid options function', function(done) {
			var stream = requirejsOptimize(function() {
				return function() { };
			});

			stream.on('error', function(err) {
				try {
					err.message.should.equal('Options function must produce an options object');
					done();
				} catch (err) {
					done(err);
				}
			});

			stream.write(fixture('main.js'));
		});

		it('should emit errors from requirejs', function(done) {
			var stream = requirejsOptimize();

			stream.write(fixture('error.js'));

			stream.on('error', function() {
				done();
			});

			stream.end();
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

					if (count === 2) {
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

		it('should support gulp-sourcemaps', function(done) {
			this.timeout(30000);

			var stream = requirejsOptimize({
				optimize: 'uglify2'
			});

			var buffer = constructBuffer(stream);

			stream.on('end', function() {
				try {
					buffer.should.have.length(1);

					var output = buffer[0];

					should.exist(output.sourceMap);

					output.sourceMap.should
						.have.property('sources')
						.which.is.an.Array()
						.and.has.lengthOf(4);

					output.sourceMap.should
						.have.property('sourcesContent')
						.which.is.an.Array()
						.and.has.lengthOf(4);

					output.sourceMap.sources[0].should.equal('three.js');
					output.sourceMap.sources[1].should.equal('one.js');
					output.sourceMap.sources[2].should.equal('two.js');
					output.sourceMap.sources[3].should.equal('main.js');

					done();
				} catch (err) {
					done(err);
				}
			});

			var file = fixture('main.js');
			file.sourceMap = {};

			stream.write(file);

			stream.end();
		});

	});
});
