'use strict';

var gulp = require('gulp'),
	coveralls = require('gulp-coveralls'),
	istanbul = require('gulp-istanbul'),
	jshint = require('gulp-jshint'),
	jscs = require('gulp-jscs'),
	mocha = require('gulp-mocha'),
	runSequence = require('run-sequence');

var paths = {
	scripts: 'index.js',
	tests: 'test/*.js'
};

gulp.task('jshint', function() {
	return gulp.src([paths.scripts, paths.tests, 'gulpfile.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(jshint.reporter('fail'))
		.pipe(jscs());
});

gulp.task('test', function(done) {
	gulp.src(paths.scripts)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire())
		.on('finish', function() {
			gulp.src(paths.tests)
				.pipe(mocha())
				.pipe(istanbul.writeReports())
				.on('end', done);
		});
});

gulp.task('coveralls', function() {
	return gulp.src('coverage/lcov.info')
		.pipe(coveralls());
});

gulp.task('ci', function(done) {
	runSequence('jshint', 'test', 'coveralls', done);
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['jshint', 'test']);
});

gulp.task('default', ['jshint', 'test']);
