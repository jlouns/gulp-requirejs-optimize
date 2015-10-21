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

### Multiple Modules
Each file passed to the plugin is optimized as a separate module.

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');

gulp.task('scripts', function () {
	return gulp.src('src/modules/*.js')
		.pipe(requirejsOptimize())
		.pipe(gulp.dest('dist'));
});
```

### Options generating function
Options can also be specified in the form of an options-generating function to generate custom options for each file passed. This can be used to apply custom logic while optimizing multiple bundles or modules in an app.

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
				include: 'subdir/' + file.relative
			};
		}))
		.pipe(gulp.dest('dist'));
});
```

### Sourcemaps support
The plugin supports [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps) only if both `uglify2` optimization is used and `preserveLicenseComments` is set to false, as described in the `r.js` docs. If neither of these options are defined and the gulp-sourcemaps plugin is detected, the plugin will automatically set `optimize` to uglify2 and `preserveLicenseComments` to false.

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', function () {
	return gulp.src('src/main.js')
		.pipe(sourcemaps.init())
		.pipe(requirejsOptimize())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist'));
});
```

## API

### requirejsOptimize(options)

#### options

Options are the same as what is supported by the [r.js optimizer](https://github.com/jrburke/r.js/blob/master/build/example.build.js) except for `out`, `modules`, and `dir`.

The options parameter can be specified as a static object or an options-generating function. Options-generating functions are passed a file object and are expected to generate an options object.

## Differences From r.js

### out
r.js supports `out` as a string describing a path or a function which processes the output. Since we need to pass a virtual file as output, we only support the string version of `out`.

### modules and dir
r.js supports an array of `modules` to optimize multiple modules at once, using the `dir` parameter for the output directory. The same thing can be accomplished with this plugin by passing the main file of each module as input to the plugin. `gulp.dest` can be used to specify the output directory.

This means an r.js config file for optimizing multiple modules that looks like this:
```json
{
	"baseUrl": "src/modules",
	"dir": "dist",
	"modules": [{
		"name": "one"
	}, {
		"name": "two"
	}]
}
```

Would look like this as a gulp task with this plugin:
```js
gulp.task('scripts', function () {
	return gulp.src('src/modules/*.js')
		.pipe(requirejsOptimize())
		.pipe(gulp.dest('dist'));
});
```

## License

MIT © [Jonathan Lounsbury](https://github.com/jlouns)
