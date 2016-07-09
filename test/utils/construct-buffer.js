'use strict';

module.exports = function constructBuffer(stream) {
	var buffer = [];

	stream.on('data', function(file) {
		buffer.push(file);
	});

	return buffer;
};
