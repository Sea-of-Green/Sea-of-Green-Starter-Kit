var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
// Sass & CSS
var sass = require('gulp-sass');
var neat = require('node-neat').includePaths;
var autoprefixer = require('gulp-autoprefixer');
var cmq = require('gulp-combine-media-queries');
var csso = require('gulp-csso');
var uncss = require('gulp-uncss');
// HTML
var typogr = require('gulp-typogr');
var inject = require('gulp-inject');
var include = require('gulp-file-include');
// Javascript
var uglify = require('gulp-uglify');
// Servers
var browserSync = require('browser-sync');

var paths = {
  src: 'src',
  dist: 'dist',

  content: 'src/markup/**/*.html',
  contentPath: 'src/markup',
  html: 'dist/**/*.html',

  sass: 'src/stylesheets/*.scss',
  sassPath: 'src/stylesheets',
  css: 'dist/css/**/*.css',
  cssPath: 'dist/css',

  scripts: 'src/scripts/**/*.js',
  scriptsPath: 'src/scripts',
  js: 'dist/js/**/*.js',
  jsPath: 'dist/js'
};

gulp.task('default', ['clean', 'build']);

// Sass & CSS

gulp.task('sass', function() {
  return compressed = gulp.src(paths.sass)
    .pipe(sass({
      includePaths: neat
    }))
    .pipe(uncss({
      html: [paths.content]
    }))
    .pipe(cmq())
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(gulp.dest(paths.cssPath))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('sass:debug', function() {
  return gulp.src(paths.sass)
    .pipe(sass({
      outputStyle: 'nested',
      includePaths: neat
    }))
    .pipe(sass().on('error', sass.logError))
    .pipe(uncss({
      html: [paths.content]
    }))
    .pipe(cmq())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.cssPath));
});

gulp.task('clean:sass', function() {
  return del(paths.cssPath)
});

// HTML

gulp.task('html', ['sass', 'js'], function() {
  var sources = gulp.src([paths.js, paths.css], {read: false});

  return gulp.src(['src/markup/**/*.html', '!src/markup/{includes,includes/**}'])
    .pipe(include({
      prefix: '@@',
      basepath: 'src/markup/includes'
    }))
    .pipe(inject(sources, {
      ignorePath: paths.dist
    }))
    .pipe(typogr({
      only: ['amp', 'widont', 'smartypants']
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Javascript

gulp.task('js', function() {
  return gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.jsPath))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('js:debug', function() {
  return gulp.src(paths.scripts)
    .pipe(concat('main.js'))
    .pipe(gulp.dest(paths.jsPath))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('clean:js', function() {
  return del(paths.jsPath)
});

// Clean & Build

gulp.task('clean', function() {
  del(paths.dist);
});

gulp.task('build', ['html'], function() {
  return gulp.src('src/images/**')
    .pipe(gulp.dest('dist/images/'));
});

// Servers & Watch

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'dist'
    },
  })
});

gulp.task('watch', ['browserSync', 'build'], function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.content, ['html']);
  gulp.watch(paths.scripts, ['js']);
});
