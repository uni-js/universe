const gulp = require('gulp');
const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');
const tsconfig = require('../tsconfig.json');
const cp = require('child_process');
const ts = require('gulp-typescript');
const debug = require('gulp-debug');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const Path = require('path');

const compileTypeScript = ts.createProject(tsconfig.compilerOptions);

const path = {
	webDest: 'web-dist',
	serverDest: 'lib',
	sourceClient: ['src/**/*{.ts,.tsx,.css}'],
	sourceServer: ['src/**/*.ts'],
	entry: 'src/client/bootstrap.ts',
	publicDir: 'public',
	public: 'public/**/*',
	texture: 'public/texture/**/*',
};

gulp.task('bundle-client-by-webpack', () => {
	return gulp
		.src(path.entry)
		.pipe(webpackStream(webpackConfig(process.env.TEXTURE_LOADED, true), webpack))
		.pipe(gulp.dest(path.webDest));
});

gulp.task('watch-client-by-webpack', (cb) => {
	const config = webpackConfig(process.env.TEXTURE_LOADED, false);
	config.entry = Path.resolve(path.entry);
	config.devServer.static = { directory: Path.resolve(path.publicDir) };
	const webpackCompiler = webpack(config);
	new webpackDevServer(config.devServer, webpackCompiler).startCallback(cb);
});

gulp.task('copy-public-to-dist', () => {
	return gulp.src(path.public).pipe(gulp.dest(path.webDest));
});

gulp.task('compile-as-typescript', () => {
	return gulp
		.src(path.sourceServer)
		.pipe(cached('ts-compile'))
		.pipe(debug({ title: 'compile: ' }))
		.pipe(compileTypeScript())
		.pipe(remember('ts-compile'))
		.pipe(gulp.dest(path.serverDest));
});

gulp.task('client', gulp.series('copy-public-to-dist', 'bundle-client-by-webpack'));
gulp.task('watch-client', gulp.series('watch-client-by-webpack'));

gulp.task('server', gulp.series('compile-as-typescript'));

gulp.task(
	'watch-server',
	gulp.series('server', () => {
		let server;
		function spawnServer() {
			server = cp.spawn('node', ['./lib/server/bootstrap'], {
				stdio: 'inherit',
			});
		}
		function killServer() {
			server.kill();
		}
		spawnServer();

		const watcher = gulp.watch(
			path.sourceServer,
			gulp.series(
				(cb) => {
					killServer();
					cb();
				},
				'server',
				(cb) => {
					spawnServer();
					cb();
				},
			),
		);

		watcher.on('change', function (event) {
			if (event.type === 'deleted') {
				delete cached.caches.scripts[event.path];
				remember.forget('ts-compile', event.path);
			}
		});
	}),
);

gulp.task('default', (callback) => {
	console.log('please pick a task first: client, watch-client, server, watch-server');
	callback();
});
