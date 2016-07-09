'use strict';

require('should');

module.exports = function compare(actual, expected) {
	String(actual.contents).trim().should.equal(String(expected.contents).trim());
};
