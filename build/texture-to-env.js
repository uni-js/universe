const through = require('through2');
const path = require('path');
const replaceAll = require('replace-string');

function isTexture(pathname) {
	const exts = ['.png', '.jpg', '.json'];
	return exts.includes(path.extname(pathname));
}

/**
 * texture auto-loader
 */
module.exports = function TextureToEnv(postHandler) {
	const loaded = [];
	const stream = through.obj(function (file, enc, cb) {
		if (!file.isDirectory() && isTexture(file.relative)) {
			const filePath = replaceAll(file.relative, path.sep, '/');
			loaded.push(filePath);

			postHandler && postHandler(filePath);
		}

		this.push(file);
		cb();
	});
	stream.on('end', () => {
		process.env.TEXTURE_LOADED = JSON.stringify(loaded);
	});
	return stream;
};
