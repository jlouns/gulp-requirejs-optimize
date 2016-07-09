'use strict';

var path = require('path');

var getFile = require('./get-file');

module.exports = function fixture(filepath) {
	return getFile(path.join('test', 'fixtures', filepath));
};
