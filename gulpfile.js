'use strict';

var gulp = require('gulp');

var coveralls = require('gulp-coveralls');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var runSequence = require('run-sequence');
var xo = require('gulp-xo');

var paths = {
	scripts: 'index.js',
	tests: 'test/*.js'
};

gulp.task('lint', function() {
	return gulp.src([paths.scripts, paths.tests, 'test/utils/*.js', 'gulpfile.js'])
		.pipe(xo());
});

gulp.task('pre-test', function() {
	return gulp.src(paths.scripts)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function() {
	return gulp.src(paths.tests)
		.pipe(mocha())
		.pipe(istanbul.writeReports());
});

gulp.task('coveralls', function() {
	return gulp.src('coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('ci', function(done) {
	runSequence('lint', 'test', 'coveralls', done);
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test']);
