# [gulp](http://gulpjs.com)-requirejs-optimize [![Build Status](https://travis-ci.org/jlouns/gulp-requirejs-optimize.svg?branch=master)](https://travis-ci.org/jlouns/gulp-requirejs-optimize)

> Optimize AMD modules in javascript files using the [requirejs](https://www.npmjs.org/package/requirejs) optimizer.


## Install

```sh
$ npm install --save-dev gulp-requirejs-optimize
```


## Usage

```js
var gulp = require('gulp');
var requirejsOptimize = require('gulp-requirejs-optimize');

gulp.task('default', function () {
	return gulp.src('src/file.ext')
		.pipe(requirejsOptimize())
		.pipe(gulp.dest('dist'));
});
```


## API

### requirejsOptimize(options)

#### options

##### foo

Type: `boolean`  
Default: `false`

Lorem ipsum.


## License

MIT © [Jonathan Lounsbury](https://github.com/jlouns)
