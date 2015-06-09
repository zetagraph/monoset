/*global -$ */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var reportError = function(error) {
  $.notify({
    title: 'Gulp Task Error',
    message: 'Check the console.'
  }).write(error);
  console.log(error.toString());
  this.emit('end');
}

gulp.task('sass', function() {
  return gulp.src('scss/**/*.scss')
    .pipe($.sourcemaps.init())
    // Convert sass into css
    .pipe($.sass({
      outputStyle: 'nested', // libsass doesn't support expanded yet
      precision: 10
    }))
    // Show Error Notice
    .on('error', reportError)
    // Autoprefix properties
    .pipe($.autoprefixer({
      browsers: ['last 2 versions']
    }))
    // Write sourcemaps
    .pipe($.sourcemaps.write())
    // Save the CSS
    .pipe(gulp.dest('styles'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Process JS files and return the stream.
gulp.task('js', function() {
  return gulp.src('scripts/**/*.js')
    .pipe(gulp.dest('scripts'));
});

// Run drush to clear the theme registry
gulp.task('drush', function() {
  return gulp.src('', {
      read: false
    })
    .pipe($.shell([
      'drush cc css-js',
    ]))
    .pipe($.notify({
      title: "Caches cleared",
      message: "Drupal CSS/JS caches cleared.",
      onLast: true
    }));
});

// BrowserSync
gulp.task('browser-sync', function() {
  //watch files
  var files = [
    'styles/main.css',
    'scripts/**/*.js',
    'images/**/*',
    'templates/**/*.twig'
  ];
  //initialize browsersync
  browserSync.init(files, {
    proxy: "d8.dev" // BrowserSync proxy, change to match your local environment
  });
});

// Default task to be run with `gulp`
gulp.task('default', ['sass', 'js', 'browser-sync'], function() {
  gulp.watch("scss/**/*.scss", ['sass']);
  gulp.watch("scripts/**/*.js", ['js']);
});