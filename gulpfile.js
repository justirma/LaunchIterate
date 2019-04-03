"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// // Load package.json for banner
// const pkg = require("./package.json");

// // Set the banner content
// const banner = [
//   "/*!\n",
//   " * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n",
//   " * Copyright 2013-" + new Date().getFullYear(),
//   " <%= pkg.author %>\n",
//   " * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n",
//   " */\n",
//   "\n"
// ].join("");

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/", "./dist/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp
    .src("./node_modules/bootstrap/dist/**/*")
    .pipe(gulp.dest("./dist/vendor/bootstrap"));
  // Font Awesome
  var fontAwesome = gulp
    .src("./node_modules/@fortawesome/**/*")
    .pipe(gulp.dest("./dist/vendor"));
  // jQuery Easing
  var jqueryEasing = gulp
    .src("./node_modules/jquery.easing/*.js")
    .pipe(gulp.dest("./dist/vendor/jquery-easing"));
  // jQuery
  var jquery = gulp
    .src([
      "./node_modules/jquery/dist/*",
      "!./node_modules/jquery/dist/core.js"
    ])
    .pipe(gulp.dest("./dist/vendor/jquery"));
  // Simple Line Icons
  var simpleLineIconsFonts = gulp
    .src("./node_modules/simple-line-icons/fonts/**")
    .pipe(gulp.dest("./dist/vendor/simple-line-icons/fonts"));
  var simpleLineIconsCSS = gulp
    .src("./node_modules/simple-line-icons/css/**")
    .pipe(gulp.dest("./dist/vendor/simple-line-icons/css"));
  return merge(
    bootstrap,
    fontAwesome,
    jquery,
    jqueryEasing,
    simpleLineIconsFonts,
    simpleLineIconsCSS
  );
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: "expanded",
        includePaths: "./node_modules"
      })
    )
    .on("error", sass.logError)
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest("./dist/css"))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest("./dist/css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src(["./js/*.js", "!./js/*.min.js"])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(gulp.dest("./dist/js"))
    .pipe(browsersync.stream());
}

function copyHTML() {
  return gulp.src(["./index.html", "./FAQ.html"]).pipe(gulp.dest("./dist"));
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./js/**/*", js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, copyHTML));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
