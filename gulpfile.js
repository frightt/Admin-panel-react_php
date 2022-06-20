const  gulp = require("gulp");
const webpack = require("webpack-stream");
const sass = require('gulp-sass')(require('sass'));

const dist = "C:/OpenServer/domains/react_admin/admin";

gulp.task("copy-html", () => {
    return gulp.src("./src/index.html")
        .pipe(gulp.dest(dist));
});

gulp.task("build-js", () => {
    return gulp.src("./src/main.js")
        .pipe(webpack({
            mode: 'development',
            output: {
                filename: 'script.js'
            },
            watch: false,
            devtool: "source-map",
            module: {
                rules: [
                    {
                        test: /\.m?js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: [['@babel/preset-env', {
                                    debug: true,
                                    corejs: 3,
                                    useBuiltIns: "usage"
                                }],
                                    "@babel/react"]
                            }
                        }
                    }
                ]
            }
        }))
        .pipe(gulp.dest(dist));
});

gulp.task("build-sass", () => {
    return gulp.src("./scss/style.scss")
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(dist));
});

gulp.task("copy-api", () => {
    return gulp.src("./api/**/*.*")
        .pipe(gulp.dest(dist + "/api"));
});

gulp.task("copy-assets", () => {
    return gulp.src("./assets/**/*.*")
        .pipe(gulp.dest(dist + "/assets"));
});

gulp.task("watch", () => {
    gulp.watch("./src/index.html", gulp.parallel("copy-html"));
    gulp.watch("./src/**/*.*", gulp.parallel("build-js"));
    gulp.watch("./scss/**/*.scss", gulp.parallel("build-sass"));
    gulp.watch("./api/**/*.*", gulp.parallel("copy-api"));
    gulp.watch("./assets/**/*.*", gulp.parallel("copy-assets"));

});

gulp.task("build", gulp.parallel("copy-html", "copy-assets", "copy-api", "build-sass", "build-js"));

gulp.task("default", gulp.parallel("watch", "build"));