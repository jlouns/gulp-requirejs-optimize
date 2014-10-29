'use strict';

var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	mocha = require('gulp-mocha'),
	istanbul = require('gulp-istanbul'),
	coveralls = require('gulp-coveralls');

var paths = {
	scripts: './index.js',
	tests: './test/*.js'
};

gulp.task('lint', function () {
	return gulp.src([paths.scripts, paths.tests, 'gulpfile.js'])
		.pipe(jshint())
		.pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('test', function () {
	return gulp.src(paths.tests)
		.pipe(mocha());
});

gulp.task('coverage', function (done) {
	gulp.src(paths.scripts)
		.pipe(istanbul())
		.on('finish', function () {
			gulp.src(paths.tests)
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.on('end', done);
		});
});

gulp.task('coveralls', ['coverage'], function () {
	return gulp.src('./coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('watch', function () {
	gulp.watch(paths.scripts, ['lint', 'test']);
});

gulp.task('default', ['lint', 'test']);
