'use strict';




/*************

  DEPENDENCIES

 ************/


// Native modules
var fs = require('fs');
var path = require('path');

// Gulp and basic utilities
var gulp = require('gulp');

// Workflow utilities
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');

// various file utils
var rename = require('gulp-rename');

// SASS & PostCSS
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');


// Scripts
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');





/************************

   VARIABLES & BASIC SETUP

 ***********************/



// Assets in Source Directory (Private)
var srcDir = "src" ; // Main source folder
var srcSassDir = srcDir + '/sass';
var srcImagesDir =  srcDir + '/images';
var srcJsDir =  srcDir + '/javascript';

// Assets in Distribution directory
var distDir = 'dist'; // Main dist folder
var distCssDir = distDir + '/css';
var distImagesDir = distDir + '/images';
var distJsDir = distDir + '/javascript';


// Enviroment variable. 'dev' by default, set to prod in prod-init task 
var env = 'dev';





/************************

    SCSS

 ***********************/


 /**
 * Compile SASS and minify
 **/

// Tab Processors 
var processors = [
    autoprefixer({browsers: ['last 2 versions','> 2%','ie >= 9']})
];


gulp.task('styles', function(){


    if (env == 'dev') { // DEVELOPPEMENT

      return gulp.src( srcSassDir + '/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({ outputStyle: 'expanded' })
                    .on('error', sass.logError)
              )
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe(rename("styles.css"))
        .pipe(gulp.dest(distCssDir) )
        .pipe(reload({ stream: true }))


    }else if (env == 'prod') { // PRODUCTION


      return gulp.src( srcSassDir + '/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({ outputStyle: 'compressed' })
                    .on('error', sass.logError)
              )
        .pipe(postcss(processors))
        .pipe(sourcemaps.write())
        .pipe( rename( function(file){
            file.extname = '.min.css';
        }) )
        .pipe( gulp.dest(distCssDir) )
        .pipe(reload({ stream: true }))

    }


});





/************************

    Javascript

 ***********************/


 /**
 * Concat javascript and minify
 **/


// DEVELOPPEMENT

gulp.task('scripts', ['jsLint'], function(){


      var orderedScripts = [

        // Polyfills

        // Libs only first level elements in the vendors folder
        path.join(srcJsDir, 'vendors')+'/jQuery.js',

        //Then my scripts
        path.join(srcJsDir)+'/*.js'


    ];


    return gulp.src(orderedScripts)
        .pipe(plumber())
        .pipe( sourcemaps.init() )
        .pipe( concat('scripts.js') )
        .pipe( sourcemaps.write() )
        .pipe( gulp.dest(distJsDir) )
        .pipe( browserSync.stream() );


});


gulp.task('jsLint',function(){


  return gulp.src(srcJsDir +'/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))


})




// PRODUCTION

gulp.task('minScripts', ['scripts'], function(){


    return gulp.src(distJsDir+'/scripts.js')
      .pipe( uglify() )
      .pipe( rename('scripts.min.js') )
      .pipe( gulp.dest(distJsDir) );


});





/************************

    WATCH TASKS

 ***********************/


/**
 * Start Browser sync server
 **/


gulp.task('browser-sync', function() {
    return browserSync.init({
        server: {
            baseDir     : distDir,
            directory   : true
        },
        browser: "google chrome",
        open: true,
        reloadOnRestart : true,
        online : true
    });
});








/**
 * Start Watching
 **/


gulp.task('watch', ['browser-sync'], function(){

    gulp.watch(srcSassDir +'/**/*.scss', ['styles']);
    gulp.watch(srcJsDir +'/**/*.js', ['scripts']);
    gulp.watch("**/*.html").on('change', browserSync.reload);

});





/************************

  TASKS LIST

 ***********************/


 // Set Tasks

 gulp.task('prodInit', function () {
  env = 'prod';
});



 // Final Tasks

gulp.task('default', ['styles', 'scripts']);

gulp.task('prod', ['prodInit', 'styles', 'minScripts']);



