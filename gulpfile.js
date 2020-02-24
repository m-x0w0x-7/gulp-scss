const gulp = require('gulp');

// scss
const sass = require('gulp-sass');
const glob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexBugsFixes = require('postcss-flexbugs-fixes');

// utility
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const del = require('del');


const paths = {
  scss: './src/scss',
  root: './dist',
  css: './dist/css'
}


// scss
function scss() {
  const autoprefixerOption = {
    grid: true
  };
  const postcssOption = [
    flexBugsFixes,
    autoprefixer( autoprefixerOption )
  ];

  return gulp
    .src(paths.scss + '/**/*.scss', { sourcemaps: true })
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(glob())
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(postcss(postcssOption))
    .pipe(gulp.dest( paths.css, {
      sourcemaps: './'
    } ))
    .pipe(browserSync.reload({ stream: true }));
}

// scss build
function scssBuild() {
  const autoprefixerOption = {
    grid: true
  };
  const postcssOption = [
    flexBugsFixes,
    autoprefixer( autoprefixerOption )
  ];

  return gulp
    .src(paths.scss + '/**/*.scss', { sourcemaps: false })
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(glob())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(postcss(postcssOption))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({ stream: true }));
}


// browser sync
function serve(done) {
  browserSync.init({
    // local
    server: {
      baseDir: paths.root
    },
    // proxy
    // proxy: 'localhost',
    ghostMode: false,
    open: 'local',
    notify: true,
  });
  done();
}


// watch
function watch(done) {
  gulp.watch(paths.scss + '/**/*.scss', gulp.parallel(scss));
  done();
}


// clean
function clean() {
  return del(paths.root + '/**/*');
}


// default task(dev)
exports.default = gulp.series(
  gulp.parallel(scss),
  gulp.parallel(serve, watch)
);

// default task(build)
exports.build = gulp.series(
  clean,
  gulp.parallel(scssBuild),
  gulp.parallel(serve, watch)
)
