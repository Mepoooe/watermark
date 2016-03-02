//===============================================
// ПЕРЕМЕННЫЕ
//===============================================

var
    gulp = require('gulp'),
    cssGlobbing = require('gulp-css-globbing'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    rename = require("gulp-rename"),
    changed = require('gulp-changed'),
    htmlmin = require('gulp-htmlmin'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    runSequence = require('gulp-run-sequence'),
    del = require('del'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    concat = require('gulp-concat'),
    wiredep = require('wiredep').stream,
    gulpif = require('gulp-if'),
    useref = require('gulp-useref'),
    jade = require('gulp-jade'),
    pipe = require('multipipe'),
    cache = require('gulp-cached'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    lazypipe = require('lazypipe'),
    spritesmith = require('gulp.spritesmith'),
    merge = require('merge-stream'),
    browserify = require('gulp-browserify'),
    modernizr = require('gulp-modernizr');

//===============================================
// ПУТИ
//===============================================

var paths = {

    scriptsDev: 'app/js/',
    scriptsDist: 'dist/js/',
    spriteDev: 'app/resources/img/sprite/',
    imgDev: 'app/resources/img/',
    scss: 'app/scss/',
    stylesDist: 'dist/css/',
    jade: 'app/jade/'

};

//===============================================
// ЗАДАЧИ
//===============================================

// генерирует спрайт
gulp.task('sprite', function () {

    var spriteData = gulp.src(paths.spriteDev + '*.png').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../img/sprite.png',
        cssName: '_sprite.scss',
        cssFormat: 'scss',
        padding: 10,
        cssTemplate: 'handlebarsInheritance.scss.handlebars'
    }));

    var imgStream = spriteData.img.pipe(gulp.dest(paths.imgDev));
    var scssStream = spriteData.css.pipe(gulp.dest(paths.scss + '_common'));

    return merge(imgStream, scssStream);

});

// Компилируем scss и кладем его в dist/css
gulp.task('sass', function() {

        return gulp.src(paths.scss + 'main.scss')
                .pipe(cssGlobbing({
                    extensions: ['.scss']
                }))
                .pipe(sourcemaps.init())
                    .pipe(sass()
                        .on('error', sass.logError))
                    .pipe(prefix("last 2 version", "> 1%", "ie 9", "ie 8"))
                .pipe(sourcemaps.write())
                .pipe(rename('styles.css'))
                .pipe(gulp.dest(paths.stylesDist));

});

// Компилирует jade
gulp.task('jade', function() {

    return gulp.src(paths.jade + 'index.jade')
            .pipe(plumber())
            .pipe(jade({
                pretty: true
            }))
            .pipe(gulp.dest('dist'));

});

gulp.task('scripts', function() {
    return gulp.src(paths.scriptsDev + 'entry.js')
        .pipe(plumber())
        .pipe(browserify({
            debug : true
        }))
        .pipe(rename('scripts.js'))
        .pipe(gulp.dest(paths.scriptsDist));
});

// Сборка файла modernizr
gulp.task('modernizr', function() {
    return gulp.src(paths.scriptsDev + '*.js')
        .pipe(modernizr('modernizr.min.js', {
            'options': [
                'setClasses'
            ],
            'tests': [
                'csscolumns',
                'flexbox'
            ],
            'uglify': true
        }))
        .pipe(uglify())
        .pipe(gulp.dest(paths.scriptsDist));
});

// Подключает bower файлы к html файлам
gulp.task('wiredep', function() {

    return gulp.src(paths.jade + '**/*.jade')
        .pipe(wiredep({
            ignorePath: '../../'
        }))
        .pipe(gulp.dest(paths.jade));

});

// Склеивает и минифицирует все bower скрипты и стили, а также прописывает путь к новым файлам в html страницах
gulp.task('useref', function () {

    return gulp.src('dist/*.html')
        .pipe(useref({}))
        .pipe(cache('useref'))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));

});

// Копируем всё из папки resources в dist
gulp.task('copy', function() {

    return gulp.src('app/resources/**/*')
        .pipe(changed('dist'))
        .pipe(gulp.dest('dist'));

});

// Очищаем папку dist
gulp.task('clean', function() {

    return del('dist');

});

// Сервер
gulp.task('server', function () {
    browserSync({
        port: 9000,
        server: {
            baseDir: 'dist',
            routes: {
                "/app": "app",
                "/bower_components": "bower_components"
            }
        }
    });
});

//Watch task
gulp.task('watch', function() {

    global.watch = true;

    watch(paths.scss + '**/*.scss', function() {
        runSequence('sass', browserSync.reload);
    });

    watch(paths.jade + '**/*.jade', function() {
        runSequence('jade', browserSync.reload);
    });

    watch(paths.scriptsDev + '**/*.js', function() {
        runSequence('scripts', browserSync.reload);
    });

    watch('app/resourses/**/*', function(event) {

        if (event) {
            runSequence('copy', browserSync.reload);
        }

    });

    watch(paths.spriteDev + '/**/*.png', function(event) {

        if (event) {
                runSequence('sprite', 'copy');
        }

    });

    watch('bower.json', function() {
        runSequence('wiredep', browserSync.reload);
    });

});

// Сборка на продакшн
gulp.task('build', ['clean'], function() {
    runSequence(
        'wiredep',
        'modernizr',
        'jade',
        'sprite',
        'copy',
        'sass',
        'scripts',
        'useref'
    );
});

// Задача по умолчанию
gulp.task('default', ['clean'], function() {
    runSequence(
        'wiredep',
        'modernizr',
        'jade',
        'sprite',
        'copy',
        'sass',
        'scripts',
        'server',
        'watch'
    );
});


