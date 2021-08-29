// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DotEnv = require('dotenv-webpack');
const { DefinePlugin } = require('webpack');
const JsStringEscape = require('js-string-escape');
const isProduction = process.env.NODE_ENV == 'production';

module.exports = (textureLoaded) => {
	return {
		devtool: false,
		mode: isProduction ? 'production' : 'development',

		plugins: [
			new HtmlWebpackPlugin({
				template: './static/index.html',
			}),
			new DefinePlugin({
				'process.env.TEXTURE_LOADED': `"${JsStringEscape(textureLoaded)}"`,
			}),
			new DotEnv(),

			// Add your plugins here
			// Learn more about plugins from https://webpack.js.org/configuration/plugins/
		],
		module: {
			rules: [
				{
					test: /\.(ts|tsx)$/i,
					loader: 'ts-loader',
					exclude: /node_modules/,
				},

				// Add your rules for custom modules here
				// Learn more about loaders from https://webpack.js.org/loaders/
			],
		},
		resolve: {
			extensions: ['.tsx', '.ts', '.js'],
			fallback: {
				path: require.resolve('path-browserify'),
			},
		},
		externals: {
			fs: 'memfs',
		},
	};
};
