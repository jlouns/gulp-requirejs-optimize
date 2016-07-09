'use strict';

var path = require('path');

var getFile = require('./get-file');

module.exports = function expected(filepath) {
	return getFile(path.join('test', 'expected', filepath));
};
