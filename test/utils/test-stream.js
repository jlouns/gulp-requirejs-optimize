'use strict';

require('should');

var fixture = require('./fixture');
var expected = require('./expected');

var constructBuffer = require('./construct-buffer');

var compare = require('./compare');

module.exports = function testStream(stream, fixtureSupplier, expectedName, done) {
	var buffer = constructBuffer(stream);

	stream.on('end', function() {
		buffer.should.have.length(1);

		var output = buffer[0];

		output.relative.should.equal(expectedName);
		compare(output, expected(expectedName));

		done();
	});

	if (typeof fixtureSupplier === 'string') {
		fixtureSupplier = fixture.bind(null, fixtureSupplier);
	}

	stream.write(fixtureSupplier());

	stream.end();
};
