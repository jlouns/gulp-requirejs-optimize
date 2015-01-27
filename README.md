# [gulp](http://gulpjs.com)-requirejs-optimize
[![Build Status](https://travis-ci.org/jlouns/gulp-requirejs-optimize.svg?branch=master)](https://travis-ci.org/jlouns/gulp-requirejs-optimize)
[![npm version](https://badge.fury.io/js/gulp-requirejs-optimize.svg)](http://badge.fury.io/js/gulp-requirejs-optimize)
[![Coverage Status](https://coveralls.io/repos/jlouns/gulp-requirejs-optimize/badge.png)](https://coveralls.io/r/jlouns/gulp-requirejs-optimize)
[![Dependency Status](https://david-dm.org/jlouns/gulp-requirejs-optimize.svg)](https://david-dm.org/jlouns/gulp-requirejs-optimize)

Optimize AMD modules in javascript files using the requirejs optimizer.


## Install

```sh
$ npm install --save-dev gulp-requirejs-optimize
```


## Usage

### Simple

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');

gulp.task('scripts', function () {
	return gulp.src('src/main.js')
		.pipe(requirejsOptimize())
		.pipe(gulp.dest('dist'));
});
```

### Custom options
gulp-requirejs-optimize accepts almost all of the same options as [r.js optimize](https://github.com/jrburke/r.js/blob/master/build/example.build.js) (see below).

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');

gulp.task('scripts', function () {
	return gulp.src('src/main.js')
		.pipe(requirejsOptimize({
			optimize: 'none',
			insertRequire: ['foo/bar/bop'],
		}))
		.pipe(gulp.dest('dist'));
});
```

### Options generating function
Options can also be specified in the form of an options-generating function to generate custom options for each file passed. This can be used to optimize multiple bundles or modules in an app.

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');

gulp.task('scripts', function () {
	return gulp.src('src/modules/*.js')
		.pipe(requirejsOptimize(function(file) {
			return {
				name: '../vendor/bower/almond/almond',
				optimize: 'none',
				useStrict: true,
				baseUrl: 'path/to/base',
				include: 'subdir/' + filename
			};
		}))
		.pipe(gulp.dest('dist'));
});
```

## API

### requirejsOptimize(options)

#### options

Options are the same as what is supported by the [r.js optimizer](https://github.com/jrburke/r.js/blob/master/build/example.build.js) except for `out`. r.js supports `out` as a string describing a path or a function which processes the output. Since we need to pass a virtual file as output, we only support the string version of `out`.

The options parameter can be specified as a static object or an options-generating function. Options-generating functions are passed a file object and are expected to generate an options object.

## License

MIT © [Jonathan Lounsbury](https://github.com/jlouns)
