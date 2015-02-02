var gulp        = require("gulp");
var sass        = require("gulp-sass");
var autoprefixer = require('gulp-autoprefixer');
var filter = require('gulp-filter')
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require("browser-sync");
var notify = require("gulp-notify");
var shell = require('gulp-shell');
var reload      = browserSync.reload;

gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')
      // Convert sass into css
      .pipe(sass({
        sourcemap: true,
        sourceComments: 'normal',
        onError: function(err) {
          return notify().write(err);
        }
      }))

      // Catch any SCSS errors and prevent them from crashing gulp
      .on('error', function (error) {
        console.error(error);
        this.emit('end');
      })

      // Load existing internal sourcemap
      .pipe(sourcemaps.init({loadMaps: true}))

      // Autoprefix properties
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))

      // Write final .map file
      .pipe(sourcemaps.write())

      // Save the CSS
      .pipe(gulp.dest('styles'))

      // Filtering stream to only css files
      .pipe(filter('sass/**/*.css'))

      .pipe(browserSync.reload({stream:true}));
});


// process JS files and return the stream.
gulp.task('js', function () {
    return gulp.src('scripts/**/*.js')
        .pipe(gulp.dest('scripts'));
});

// run drush to clear the theme registry.
gulp.task('drush', shell.task([
  'drush cache-clear theme-registry'
]));

// BrowserSynk
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
    //browsersync with a php server
    proxy: "drupal8.dev",
    notify: true
    });
});

// Default task to be run with `gulp`
gulp.task('default', ['sass', 'js',  'browser-sync'], function () {
    gulp.watch("sass/**/*.scss", ['sass']);
    gulp.watch("scripts/**/*.js", ['js']);
});
