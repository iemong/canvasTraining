'use strict';

// import
import gulp from 'gulp';
import gutil from 'gulp-util';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';
import pleeease from 'gulp-pleeease';
import pug from 'gulp-pug';
import browserSync from 'browser-sync';
import readConfig from 'read-config';
import watch from 'gulp-watch';
import RevLogger from 'rev-logger';
import source from 'vinyl-source-stream';
import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import webpackDevServer from 'webpack-dev-server';
import postcss from 'gulp-postcss';
import parseArgs from 'minimist';
import _ from 'lodash';
import postman from 'gulp-postman';


// const
const args = parseArgs(process.argv.slice(2));

const SRC = './src';
const CONFIG = './src/config';
const HTDOCS = './public';
const BASE_PATH = '';

const DEST = `${HTDOCS}${BASE_PATH}`;
const webpackConfig = require('./webpack.config');

const revLogger = new RevLogger({
    'style.css': `${DEST}/css/style.css`,
    'script.js': `${DEST}/js/script.js`
});


// css
gulp.task('sass', () => {
    const plugins = [
        require('postcss-assets')({
          loadPaths: [ `${DEST}/img/` ],
          basePath: './',
          relative: `./${DEST}/css`,
        }),
        require('autoprefixer')({
          browsers: [
            'ie >= 11',
            'ios >= 9',
            'android >= 4.4.4'
          ]
        }),
      ]
    const config = readConfig(`${CONFIG}/pleeease.json`);
    return gulp.src(`${SRC}/scss/style.scss`)
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(postcss(plugins))
        .pipe(pleeease(config))
        .pipe(gulp.dest(`${DEST}/css`));
});

gulp.task('css', gulp.series('sass'));


// js
gulp.task('webpack', () => {
    return webpackStream(webpackConfig, webpack)
        .pipe(gulp.dest(`${DEST}/js`));
});

gulp.task('js', gulp.parallel('webpack'));

// html
gulp.task('pug', () => {
    const locals = readConfig(`${CONFIG}/meta.yml`);
    locals.versions = revLogger.versions();
    locals.basePath = BASE_PATH;
    return gulp.src(`${SRC}/pug/**/[!_]*.pug`)
        .pipe(pug({
            locals:  locals,
            pretty:  true,
            basedir: `${SRC}/pug`
        }))
        .pipe(gulp.dest(`${DEST}`));
});

gulp.task('html', gulp.series('pug'));

// serve
gulp.task('browser-sync', () => {
    browserSync({
        server: {
            baseDir: HTDOCS
        },
        startPath: `${BASE_PATH}/`,
        ghostMode: false,
        https: true,
    });

    watch([`${SRC}/scss/**/*.scss`], gulp.series('sass', browserSync.reload));
    watch([`${SRC}/js/**/*.js`, `${SRC}/js/components/**/*.vue`], gulp.series('webpack', browserSync.reload));
    watch([
        `${SRC}/pug/**/*.pug`,
        `${SRC}/config/*.yml`
    ], gulp.series('pug', browserSync.reload));

    revLogger.watch((changed) => {
        gulp.series('pug', browserSync.reload)();
    });
});

gulp.task('serve', gulp.series('browser-sync'));


// default
gulp.task('build', gulp.parallel('css', 'js', 'html'));
gulp.task('default', gulp.series('build', 'serve'));
