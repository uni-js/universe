const dayjs = require('dayjs');
const meow = require('meow');
const cli = meow();

/**
 * get a semver version string
 * @param isDocker if true, replace '+' to '-'
 *
 * issue at: https://github.com/opencontainers/distribution-spec/issues/154
 */
function getNewBuildVersion(isDocker) {
	const { version } = require('../package.json');
	const date = dayjs().format('YYYYMMDDHHmmss');
	const buildMeta = `build.${date}`;

	if (isDocker) {
		return `${version}-${buildMeta}`;
	} else {
		return `${version}+${buildMeta}`;
	}
}

(function bootstrap() {
	process.stdout.write(getNewBuildVersion(cli.flags.docker));
})();
