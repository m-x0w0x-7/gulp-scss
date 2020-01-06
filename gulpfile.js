const gulp = require('gulp');
const fs = require('fs');

// pug
const pug = require('gulp-pug');
const data = require('gulp-data');

// ejs
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const replace = require('gulp-replace');

// scss
const sass = require('gulp-sass');
const glob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexBugsFixes = require('postcss-flexbugs-fixes');

// JS
const webpackStream = require('webpack-stream');
const webpack = require('webpack');

// img
const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

// utility
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const del = require('del');


const paths = {
  pug: './src/pug',
  ejs: './src/ejs',
  scss: './src/scss',
  javascript: './src/js',
  image: './src/img',
  root: './dist',
  css: './dist/css',
  js: './dist/js',
  img: './dist/img'
}



// pug
function pugFunc() {
  // JSONファイルの読み込みと変換
  const configPugData = fs.readFileSync(paths.pug + '/data/config.json');
  const configPugObj = JSON.parse(configPugData);

  return gulp
    .src([ paths.pug + '/**/*.pug', '!' + paths.pug + '/**/_*.pug' ])
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(data(file => {
      return configPugObj;
    }))
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest( paths.root ))
    .pipe(browserSync.reload({ stream: true }));
}


// ejs
function ejsFunc() {
  // JSONファイルの読み込みと変換
  const configJsonData = fs.readFileSync( paths.ejs + '/data/config.json' );
  const configObj = JSON.parse( configJsonData );

  // ejsのデータ読み込み設定
  const ejsDataOption = {
    config: configObj
  };

  return gulp
    .src([ paths.ejs + '/**/*.ejs', '!' + paths.ejs + '/**/_*.ejs' ])
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(ejs( ejsDataOption, {}, {} ))
    .pipe(rename({ extname: '.html' }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, '$1'))
    .pipe(gulp.dest( paths.root ))
    .pipe(browserSync.reload({ stream: true }));
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


// JS
// webpackの設定ファイルの読み込み
function js() {
  const webpackConfig = require('./webpack.config');

  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(paths.js))
    .pipe(browserSync.reload({ stream: true }));
}


// image
function image() {
  const imageminOption = [
    pngquant({
      quality: [0.65, 0.8]
    }),
    mozjpeg({
      quality: 80
    }),
    imagemin.gifsicle(),
    imagemin.jpegtran(),
    imagemin.optipng(),
    imagemin.svgo({
      removeViewBox: false
    })
  ];

  return gulp
  .src( paths.image + '/*' )
  .pipe(imagemin( imageminOption ))
  .pipe(gulp.dest( paths.img ))
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
  gulp.watch(paths.pug + '/**/*.pug', gulp.parallel(pugFunc));
  gulp.watch(paths.ejs + '/**/*.ejs', gulp.parallel(ejsFunc));
  gulp.watch(paths.scss + '/**/*.scss', gulp.parallel(scss));
  gulp.watch(paths.javascript + '/**/*.js', gulp.parallel(js));
  gulp.watch(paths.image + '/**/*', gulp.parallel(image));
  done();
}


// clean
function clean() {
  return del(paths.root + '/**/*');
}


// default task(dev)
exports.default = gulp.series(
  gulp.parallel(pugFunc, ejsFunc, scss, js, image),
  gulp.parallel(serve, watch)
);

// default task(build)
exports.build = gulp.series(
  clean,
  gulp.parallel(pugFunc, ejsFunc, scssBuild, js, image),
  gulp.parallel(serve, watch)
)
