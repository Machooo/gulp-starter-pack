const gulp = require('gulp'),
  sass = require('gulp-sass'),
  browsersync = require('browser-sync').create(),
  concat = require('gulp-concat'),
  concatCss = require('gulp-concat-css'),
  uglify = require('gulp-uglifyjs'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  imagemin = require('gulp-imagemin'),
  jpgmin = require('imagemin-jpegoptim'),
  pngmin = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  autoprefixer = require('gulp-autoprefixer'),
  gih = require("gulp-include-html");

const sassInit = () => {
  return gulp
    .src('app/sass/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer(['last 15 versions', '> 1%']))
    .pipe(gulp.dest('app/css'))
};

const browserSyncReload = (done) => {
  browsersync.reload();
  done();
}

const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: "app"
    },
    port: 3000,
    notify: false
  });
  done();
}

const scripts = () => {
  return (
    gulp
    .src([
      'PATH_TO_JS_LIBS'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'))
  );
}

const css = () => {
  return gulp
    .src([
      'PATH_TO_CSS_LIBS'
    ])
    .pipe(concatCss('libs.min.css'))
    .pipe(cssnano())
    .pipe(gulp.dest('app/css'));
}

const includeHtml = () => {
  return gulp
    .src("app/html/pages/*.html")
    .pipe(gih({
      baseDir: 'app/html/'
    }))
    .pipe(gulp.dest("app"));
}

const watchFiles = () => {
  gulp.watch("app/sass/**/*.scss", gulp.series(sassInit, browserSyncReload));
  gulp.watch("app/js/**/*", gulp.series(browserSyncReload));
  gulp.watch("app/html/**/*.html", gulp.series(includeHtml, browserSyncReload));
  gulp.watch('app/*.html', gulp.series(browserSyncReload));
  gulp.watch("app/images/**/*", images);
}

const deleteDist = (done) => {
  del.sync(['dist']);
  done();
};

const images = () => {
  return (
    gulp
    .src('app/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      jpgmin({
        progressive: true,
        max: 90,
        stripAll: true
      }),
      pngmin({
        quality: [0.7, 0.9]
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(gulp.dest('dist/images'))
  );
}

const clear = () => {
  return cache.clearAll();
}

const moveAll = (done) => {
  const buildCss = gulp.src('app/css/**/*')
    .pipe(gulp.dest('dist/css'))

  const buildFonts = gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))

  const buildJs = gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'))

  const buildHtml = gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));

  done();
}

const js = gulp.series(scripts);
const build = gulp.series(deleteDist, clear, sassInit, css, images, js, moveAll);
const watch = gulp.parallel(watchFiles, browserSync);

exports.images = images;
exports.css = css;
exports.sassInit = sassInit;
exports.js = js;
exports.deleteDist = deleteDist;
exports.clear = clear;
exports.build = build;
exports.watch = watch;

exports.default = watch;