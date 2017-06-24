// Globals
var browserSync = require('browser-sync'),
    gulp = require('gulp'),
    autoPrefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    flatten = require('gulp-flatten');
cssNano = require('gulp-cssnano'),
    fileInclude = require('gulp-file-include'),
    imageMin = require('gulp-imagemin'),
    sass = require('gulp-sass'),
    sftp = require('gulp-sftp'),
    sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch'),
    runSequence = require('run-sequence');

// Paths
var paths = {
    dist: './dist/',
    src: './assets/'
};

// Clean
gulp.task('clean', require('del').bind(null, [paths.dist]));

// Styles
gulp.task('styles', function() {
    return gulp.src(paths.src + 'styles/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoPrefixer({
            browsers: [
                'last 2 version',
                'android 2.3',
                'android 4',
                'opera 12'
            ]
        }))
        .pipe(cssNano())
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.dist + 'styles'))
        .pipe(browserSync.stream());
});

// Scripts
gulp.task('scripts', function() {
    return gulp.src(paths.src + 'scripts/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.dist + 'scripts'))
        .pipe(browserSync.stream());
});
gulp.task('jslibrary', function() {
    return gulp.src(paths.src + 'js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('libraries.js'))
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(paths.dist + 'scripts'))
        .pipe(browserSync.stream());
});
// Images
gulp.task('images', function() {
    return gulp.src(paths.src + 'images/*')
        .pipe(imageMin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest(paths.dist + 'images'))
        .pipe(browserSync.stream());
});

// Html
gulp.task('fileIncludeMain', function() {
    return gulp.src([paths.src + 'templates/*.html', paths.src + 'templates/*.php'])
        .pipe(fileInclude())
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.stream());
});
gulp.task('fileIncludeAdmin', function() {
    return gulp.src([paths.src + 'templates/admin/*.html', paths.src + 'templates/admin/*.php'])
        .pipe(fileInclude())
        .pipe(gulp.dest(paths.dist + 'admin/'))
        .pipe(browserSync.stream());
});

gulp.task('html', function(callback) {
    runSequence('fileIncludeMain', 'fileIncludeAdmin',
        callback);
});

// Fonts
gulp.task('fonts', function() {
    return gulp.src(paths.src + 'fonts/*')
        .pipe(flatten())
        .pipe(gulp.dest(paths.dist + 'fonts'))
        .pipe(browserSync.stream());
});

// Default Gulp Build
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        'styles',
        'scripts',
        'jslibrary',
        'fonts',
        'images',
        'html',
        callback);
});


// Gulp Build - Same as Default, but with a clean up beforehand
gulp.task('default', function() {
    runSequence(
        'clean',
        'styles',
        'scripts',
        'jslibrary',
        'fonts',
        'images',
        'html',
        'watch');
});

gulp.task('upload', function () {
    return gulp.src(paths.dist + '**/*')
        .pipe(sftp({
            host: 'gromgasper.com',
            user: 'gromgasper',
            pass: 'pass',
            remotePath: 'public_html/folder'
        }));
});

gulp.task('serve', function(callback) {
    runSequence(
        'clean',
        'styles',
        'scripts',
        'fonts',
        'images',
        'html',
        'upload');
});
/* Gulp watch - watch changes of files in 'src' folder (run it by 'gulp watch') */
gulp.task('watch', function() {
    browserSync.init({
        proxy: 'localhost/cnj',
        port: 4000,
        ui: {
            port: 4001
        },
        files: [
            "./assets/**/*.{html,js,scss}"
        ]
    });
    gulp.watch('./assets/templates/**/*', ['html']);
    gulp.watch('./assets/scripts/**/*', ['scripts']);
    gulp.watch('./assets/fonts/**/*', ['fonts']);
    gulp.watch('./assets/images/**/*', ['images']);
    gulp.watch('./assets/styles/**/*.scss', ['styles']);
});
