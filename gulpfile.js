'use strict';

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	mocha = require('gulp-mocha');

var paths = {
	scripts: './*.js',
	tests: './test/*.js'
};

gulp.task('lint', function () {
	return gulp.src(paths.scripts, paths.tests)
		.pipe(jshint())
		.pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function () {
	return gulp.src(paths.tests)
		.pipe(mocha());
});

gulp.task('watch', function () {
	gulp.watch(paths.scripts, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test']);
