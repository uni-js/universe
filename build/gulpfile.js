const gulp = require('gulp');
const textureToEnv = require('./texture-to-env');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');
const liveServer = require('gulp-live-server');
const tsconfig = require('../tsconfig.json');
const cp = require('child_process');
const ts = require('gulp-typescript');

const compileTypeScript = ts.createProject(tsconfig.compilerOptions);

const path = {
	webDest: 'web-dist',
	serverDest: 'lib',
	source: 'src/**/*',
	sourceServer: 'src/**/*{ts,tsx}',
	entry: 'src/client/index.ts',
	public: 'public/**/*',
	texture: 'public/texture/**/*',
};

gulp.task('inject-textures-to-env', () => {
	return gulp
		.src(path.texture)
		.pipe(
			textureToEnv((name) => {
				console.log('加载材质', name);
			}),
		)
		.pipe(gulp.dest(path.webDest));
});

gulp.task('bundle-client-by-webpack', () => {
	return gulp
		.src(path.entry)
		.pipe(webpackStream(webpackConfig(process.env.TEXTURE_LOADED), webpack))
		.pipe(gulp.dest(path.webDest));
});

gulp.task('copy-public-to-dist', () => {
	return gulp.src(path.public).pipe(gulp.dest(path.webDest));
});

gulp.task('compile-as-typescript', () => {
	return gulp.src(path.sourceServer).pipe(compileTypeScript()).pipe(gulp.dest(path.serverDest));
});

gulp.task('client', gulp.series('inject-textures-to-env', 'bundle-client-by-webpack', 'copy-public-to-dist'));

gulp.task(
	'watch-client',
	gulp.series('client', () => {
		const server = liveServer.static(path.webDest, 5000);
		server.start();

		gulp.watch(
			path.source,
			gulp.series(
				(cb) => {
					server.stop();
					cb();
				},
				'bundle-client-by-webpack',
				(cb) => {
					server.start();
					cb();
				},
			),
		);
	}),
);

gulp.task('server', gulp.series('compile-as-typescript'));

gulp.task(
	'watch-server',
	gulp.series('server', () => {
		let server;
		function spawnServer() {
			server = cp.spawn('node', ['./lib/server/bootstrap'], {
				stdio: ['ignore', 'pipe', 'pipe'],
			});
			server.stdout.pipe(process.stdout);
			server.stderr.pipe(process.stderr);
		}
		function killServer() {
			server.kill();
		}
		spawnServer();

		gulp.watch(
			path.source,
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
	}),
);

gulp.task('default', (callback) => {
	console.log('please pick a task first: client, watch-client, server, watch-server');
	callback();
});
