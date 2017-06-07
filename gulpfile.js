const gulp 			= require('gulp');
const sass 			= require('gulp-sass');
const concat 		= require('gulp-concat');
const uglify 		= require('gulp-uglifyjs');
const del 			= require('del');
const rename 		= require('gulp-rename');
const cleanCSS 		= require('gulp-clean-css');
const imageMin 		= require('gulp-imagemin');
const quantPNG 		= require('imagemin-pngquant');
const cache 		= require('gulp-cache');
const babel 		= require('gulp-babel');
const autoprefixer  = require('gulp-autoprefixer');
const browserSync 	= require('browser-sync');

gulp.task('styles', () => {
	return gulp.src('app/sass/*.+(sass|scss)')
	.pipe(sass().on('error', sass.logError))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions', 'ie 8', 'ie 7'], { cascade: true }))
	.pipe(cleanCSS())
	.pipe(gulp.dest('app/css/'))
	.pipe(browserSync.reload({stream: true}))
});

gulp.task('browser-sync', () => {
	browserSync.init({
		server: {
			baseDir: "app"
		},
		notify: false
	});
});

gulp.task('delete-dist', () => {
    return del.sync('dist'); 
});

gulp.task('libs', () => {
	return gulp.src([
		'./app/libs/jquery/jquery-1.11.2.min.js',
	])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./app/js/'));
});

gulp.task('image', () => {
	return gulp.src('app/img/**/*') 
		.pipe(cache(imageMin({  
			interlaced: true,
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [
				quantPNG()
			]
		})))
		.pipe(gulp.dest('dist/img')); 
});

gulp.task('clear-cache', () => {
	return cache.clearAll();
})

gulp.task('script', () => {
	return gulp.src('app/js/index.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist/js'));
})

gulp.task('watch', ['browser-sync', 'styles', 'libs', 'script'], () => {
	gulp.watch('app/sass/*.+(sass|scss)', ['styles']);
	gulp.watch('app/libs/**/*.js', ['libs']);
	gulp.watch('app/js/*.js').on("change", browserSync.reload);
	gulp.watch('app/*.html').on('change', browserSync.reload);
});

gulp.task('public', ['delete-dist', 'styles', 'script', 'libs', 'image'], () => {
	let distCSS = gulp.src('app/css/**/*.css')
	.pipe(gulp.dest('dist/css'));

	let distFonts = gulp.src('app/fonst/**/*')
	.pipe(gulp.dest('dist/fonts'));

	let distJS = gulp.src('app/js/**/*.js')
	.pipe(gulp.dest('dist/js'))
	
	let distHTML = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));
});

gulp.task('default', ['browser-sync', 'watch']);
