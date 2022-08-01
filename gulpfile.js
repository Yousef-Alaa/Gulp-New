const { src, dest, watch, series } = require('gulp');
const browserSync = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('sass'));
const prefix = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');
const gulpBeer = require('gulp-beer');
const plumber = require("gulp-plumber");
const del = require('del');
const purgecss = require('gulp-purgecss')

const tsProject = ts.createProject('tsconfig.json');
const gulpBeerFactory = require('gulp-beer/custom');
const errorHandler = gulpBeerFactory({
    title: "Gulp error ⚠️",
    sound: true,
    icon: './error.png'
});

/* 
const gulpif = require("gulp-if")
const inject = require("gulp-inject")
const babel = require("gulp-babel")
gulp-run - Run a shell command.
https://www.npmjs.com/package/gulp-replace
gulp-inject-string
gulp-rtlcss
*/

async function pugTask() {
    
    const deletedFilePaths = await del(['dist/**/*.html']);
    
    return src('src/pug/**/*.pug')
        .pipe(plumber({ errorHandler }))
        .pipe(pug({ pretty: true }))
        .pipe(dest('dist/'))
        .pipe(browserSync.stream());
}

async function buildStyles() {

    const deletedFilePaths = await del(['dist/**/*.css']);
    
    return src('src/sass/**/*.scss')
        .pipe(plumber({ errorHandler }))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(prefix('last 2 versions'))
        .pipe(sourcemaps.write())
        .pipe(dest('./dist/css'))
        .pipe(browserSync.stream());
};

function purge() {
    return src('src/sass/libs/**/*.css')
        .pipe(purgecss({
            content: ['src/pug/**/*.pug']
        }))
        .pipe(dest('dist/css/libs'));
}

async function buildScripts() {

    const deletedFilePaths = await del(['dist/**/*.js']);

    return src('./src/typescript/**.ts')
        .pipe(plumber({ errorHandler }))
        .pipe(tsProject())
        .pipe(uglify())
        .pipe(dest('./dist/js'))
        .pipe(browserSync.stream());
}

function watcher() {

    // Error Server
    gulpBeer.server.start({sound: true});

    // Local Server
    browserSync.init({
        host: "192.168.1.8",
        server: { baseDir: "./dist" }
    });

    // Watch Files
    watch(['src/pug/**/*.pug'], series(pugTask, purge)).on('change', browserSync.reload);
    watch(['src/sass/**/*.scss'], buildStyles).on('change', browserSync.reload);
    watch(['./src/typescript/**.ts'], buildScripts).on('change', browserSync.reload);
}

exports.default = watcher;