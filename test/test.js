/* global describe, it */
'use strict';

var path = require('path');

var should = require('should');
var Vinyl = require('vinyl');
var requirejsOptimize = require('../');

var fixture = require('./utils/fixture');
var expected = require('./utils/expected');

var constructBuffer = require('./utils/construct-buffer');

var compare = require('./utils/compare');

var testStream = require('./utils/test-stream');

describe('gulp-requirejs-optimize', function() {
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

				output.isNull().should.be.true();

				done();
			} catch (err) {
				done(err);
			}
		});

		stream.write(new Vinyl());

		stream.end();
	});

	it('should error on stream file', function(done) {
		var stream = requirejsOptimize();
		var contentStream = requirejsOptimize();

		stream.on('error', function(err) {
			try {
				err.message.should.equal('Streaming not supported');
				done();
			} catch (err) {
				done(err);
			}
		});

		stream.write(new Vinyl({
			contents: contentStream
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

	it('should accept a non .js file', function(done) {
		var stream = requirejsOptimize({
			out: 'main.js'
		});

		var fixtureSupplier = function() {
			var input = fixture('main.js');
			input.path = path.join('test', 'fixtures', 'main');
			return input;
		};

		testStream(stream, fixtureSupplier, 'main.js', done);
	});

	it('should accept Windows paths', function(done) {
		var stream = requirejsOptimize({
			out: 'main-windows.js'
		});

		var fixtureSupplier = function() {
			var input = fixture('main.js');
			input.base = '.';
			input.path = path.join('test', 'fixtures', 'main.js').replace(/\//g, '\\');
			return input;
		};

		testStream(stream, fixtureSupplier, 'main-windows.js', done);
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
		var stream = requirejsOptimize();

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

				String(output.contents).should.not.containEql('sourceMappingURL');

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
