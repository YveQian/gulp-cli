
/**
 * @description: gulp配置文件
 * @author: Yves
 */


var gulp = require('gulp');
var concat = require('gulp-concat');        // 合并文件
var uglify = require('gulp-uglify');        // js 压缩
var pump = require('pump');                 // 压缩报错定位
var csso = require('gulp-csso');            // css压缩
var sass = require('gulp-sass')(require('node-sass'));
var autoprefixer = require("gulp-autoprefixer"); 
var imagemin = require('gulp-imagemin');    // 图片压缩
var cache = require('gulp-cache');
var clean = require('gulp-clean');          // 清空文件夹
var gulpConnect = require('gulp-connect');  //启动服务
var {createProxyMiddleware } = require('http-proxy-middleware');
var gulpif = require('gulp-if');            //判断环境
var htmltpl = require('gulp-html-tpl');     // 引用html模板
var artTemplate = require('art-template');   // 模板渲染
var htmlmin = require('gulp-htmlmin');
var babel = require('gulp-babel');
var rev = require("gulp-rev");
var revCollector = require("gulp-rev-collector");  
var rename = require('gulp-rename')          


var fs = require('fs');
let env = 'dev'
gulp.task('set_env_dev',function (cb){
        env = 'dev'
        fs.writeFile("./env.js", 'export default ' + 'dev' + ';', function(err){
            err && console.log(err);
        });
        cb()
    }
)
gulp.task('set_env_pre',function (cb){
    env = 'build'
    fs.writeFile("./env.js", 'export default ' + 'build' + ';', function(err){
        err && console.log(err);
    });
    cb()
}
)
//路径
const htmlPath = 'src/{pages,common,components}/**/*.html'
const htmlMainSrc = './src/{pages,common,components}/**/*.html'
const libsSrc = './src/libs/**/*.js'
const jsSrc = './src/{utils,pages,common,components}/**/*.js'
const cssSrc = './src/{css,pages}/**/*.scss'
const cssLibsSrc = 'src/libs/**/*.css'
const imgSrc = 'src/images/**'
const fontsSrc = './src/fonts/*.*'

gulp.task('connect',() => {
	gulpConnect.server({
		root:'./dist',
		livereload:true,
		port:8099,
        middleware: function(connect, options) {
			return [
				createProxyMiddleware('/api',  {
					 target: 'https://dev-api.sinanbao.com/v1',
					 changeOrigin:true,
					 pathRewrite:{//路径重写规则 
                        '^/api':''
                    }
				})
			]
		}
	})
})
// 打包html
gulp.task('html', ()=>{
    return gulp.src(htmlMainSrc)
        .pipe(htmltpl({
            tag: 'component',
            paths: ['src/common', 'src/components'],
            engine: function(template, data) {
                return template && artTemplate.compile(template)(data)
            },
            // 传入页面的初始化数据
            data: {
                env: env, // 环境变量
                header: false,
                g2: false
            }
        }))
        .pipe(rename({dirname: '' }))
        .pipe(gulp.dest('./dist'))
        .pipe(gulpConnect.reload());
});

// 打包js
gulp.task('js_libs' ,()=>{
    return gulp.src(libsSrc)
        .pipe(rename({dirname: '' }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulpConnect.reload());
});
// 解决压缩问题
gulp.task('uglify_check', function(cb) {
    pump([
        gulp.src(jsSrc),
        // babel(),
        uglify()
    ], cb)
})

gulp.task('js_main',gulp.series('uglify_check',()=>{
    return gulp.src(jsSrc)
        .pipe(concat('main.js'))    // 合并文件并命名
        .pipe(babel())
        .pipe(gulpif(env==='build', uglify())) // 压缩js
        .pipe(gulpif(env==='build',rev()))    
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulpif(env==='build',rev.manifest("js-rev-mainfest.json")))
        .pipe(gulp.dest('./rev/'))
        .pipe(gulpConnect.reload());
}));

// 打包css
gulp.task('css_main', ()=>{
    return gulp.src(cssSrc)   
        .pipe(sass())
        .on('error', function(err) {
            console.log('\x1B[31m%s\x1B[0m', '\nLess Error: ' + err.message + '\n')
            this.end()
        })
        .pipe(autoprefixer({
            overrideBrowserslist: [
                'last 2 versions',
                'Firefox > 10',
                'ie >= 8'
            ]
        }))
        .pipe(concat('main.css'))
        .pipe(gulpif(env==='build', csso()))// 压缩优化css
        .pipe(gulpif(env=='build',rev()))        
        .pipe(gulp.dest('./dist/css'))
        .pipe(gulpif(env=='build',rev.manifest("css-rev-mainfest.json")))
        .pipe(gulp.dest('./rev/'))
        .pipe(gulpConnect.reload());
});
gulp.task('css_libs', ()=>{
    return gulp.src(cssLibsSrc)
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/css'))
})

// 打包其他资源
gulp.task('images',  ()=> {
    return gulp.src(imgSrc)
        // .pipe(gulpif(env==='build', cache(imagemin({
        //     optimizationLevel: 5, // 取值范围：0-7（优化等级），默认：3
        //     progressive: true, // 无损压缩jpg图片，默认：false
        //     interlaced: true, // 隔行扫描gif进行渲染，默认：false
        //     multipass: true // 多次优化svg直到完全优化，默认：false
        // }))))
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('./dist/images'))
        .pipe(gulpConnect.reload());
});

gulp.task('fonts', function() {
    return gulp.src(fontsSrc)
        .pipe(rename({ dirname: '' }))
        .pipe(gulp.dest('dist/fonts'))
})

// 清空dist文件夹
gulp.task('clean', ()=>{
    return gulp.src(['./dist/*'])
        .pipe(clean());
});

 //watch文件
gulp.task('watch',() => {
    watcher(htmlPath,'html')
    watcher(jsSrc,'js_main')
    watcher(libsSrc, 'js_libs')
    watcher(cssLibsSrc, 'css_libs')
    watcher(cssSrc, 'css_main')
    watcher(imgSrc, 'images')
    function watcher(src,task){
        gulp.watch(src,gulp.series(task))
    }
})

gulp.task('rev',() => {
	return gulp.src(["./rev/*.json","./dist/*.html"])
    .pipe(revCollector())
    .pipe(gulpif(env === 'build', htmlmin({
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true, // 压缩HTML
        minifyJS: true, // 压缩页面JS
        minifyCSS: true // 压缩页面CSS
     })))
    .pipe(gulp.dest("./dist/"))
})

//启动

exports.dev = gulp.series('clean',gulp.parallel('set_env_dev','html', 'js_libs', 'js_main','css_main','css_libs','fonts','images','connect','watch'))

// 打包任务

exports.build = gulp.series('clean',gulp.parallel('set_env_pre','html', 'js_libs', 'js_main','css_main','css_libs','fonts','images'),'rev')

