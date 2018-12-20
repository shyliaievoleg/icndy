"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var replace = require('gulp-replace');
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");

var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgmin = require("gulp-svgmin");
var run = require("run-sequence").use(gulp);
var del = require("del");
var jsmin = require("gulp-uglify");
var htmlimport = require('gulp-html-import');
var concat = require('gulp-concat');
var copy = require('gulp-copy');
var htmlbeautify = require('gulp-html-beautify');


// cleans build-directory
gulp.task("clean", function () {
	return del("build");
});


// copies global project assets into build
gulp.task("copyAssets", function () {
	return gulp.src([
		"assets/js/*.js",
		"assets/css/*.css",
		"assets/fonts/*.{woff,woff2,otf,ttf}",
		"assets/img/*.{png,jpg,gif,jpeg,svg}"
	])
	.pipe(copy('build', {
		prefix: 1
	}));
});


// copies images for bem-blocks into build
gulp.task("copybemimages", function () {
	return gulp.src([
		"blocks/**/*.{png,jpg,gif,jpeg,svg}"
	])
	.pipe(copy('build/img', {
		prefix: 4
	}));
});


// concats separate js for blocks into assets/js/script.js
gulp.task('concat', function () {
	return gulp.src('blocks/**/*.js')
	.pipe(concat('script.js'))
	.pipe(gulp.dest('assets/js/'));
});


// imports html of bem-blocks into pages
// then copies html-pages into build
gulp.task('htmlimport', function () {
	gulp.src('pages/*.html')
	.pipe(htmlimport('blocks/'))
	.pipe(replace(/\n\s*<!--DEV[\s\S]+?-->/gm, ''))
	.pipe(gulp.dest('build/'));
});


// beautifies html-pages in build
gulp.task('htmlbeautify', function () {
	gulp.src('build/*.html')
	.pipe(htmlbeautify({
		"indent_size": 2
	}))
	.pipe(gulp.dest('build/'))
});


// compiles main scss in css
// then puts minified css into build/css
gulp.task("style", function () {
	gulp.src("assets/styles/style.scss")
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass())
	.pipe(postcss([
		autoprefixer({
			browsers: [
				"last 4 version",
				"last 4 Chrome versions",
				"last 4 Firefox versions",
				"last 4 Opera versions",
				"last 4 Edge versions"
			]
		}),
		mqpacker({
			sort: true
		})
	]))
	.pipe(gulp.dest("build/css"))
	.pipe(minify())
	.pipe(rename("style.min.css"))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest("build/css"))
	.pipe(server.stream());
});


// minifies compiled script.js in build (rename to script.min.js)
gulp.task("jsmin", function () {
	gulp.src("build/js/script.js")
	.pipe(jsmin())
	.pipe(rename("script.min.js"))
	.pipe(gulp.dest("build/js"));
});


// minifies images
gulp.task("images", function () {
	return gulp.src("build/img/**/*.{png,jpg,gif}")
	.pipe(imagemin([
		imagemin.optipng({
			optimizationLevel: 5
		}),
		imagemin.jpegtran({
			progressive: true
		})
	]))
	.pipe(gulp.dest("build/img"));
});


// minifies svg-images
gulp.task("svgimages", function () {
	return gulp.src("build/img/*.svg")
	.pipe(svgmin())
	.pipe(gulp.dest("build/img"));
});


// serve styles from build
gulp.task("watch", ["style"], function () {
	server.init({
		server: "build",
		notify: false,
		open: true,
		ui: false
	});

	gulp.watch(["assets/style/**/*.{scss,sass}", "blocks/**/*.{scss,sass}"], ["style"]);
	gulp.watch("./pages/*.html").on("change", function () {
		del("build/*.html");
		run("htmlimport");
		server.reload();
	});
});


//start
gulp.task("serve", function () {
	run("clean", "concat", "htmlimport", "htmlbeautify", "copyAssets", "copybemimages", "jsmin", "style", "watch" /*, "images", "svgimages"*/)
});


// build
gulp.task("build", function () {
	run("clean", "concat", "htmlimport", "htmlbeautify", "copyAssets", "copybemimages", "jsmin", "style", "images", "svgimages")
});

