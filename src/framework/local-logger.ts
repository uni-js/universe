import * as Log from 'loglevel';
import chalk from 'chalk';
import LoggerPrefixPlugin from 'loglevel-plugin-prefix';

const colors: Record<string, chalk.Chalk> = {
	TRACE: chalk.magenta,
	DEBUG: chalk.cyan,
	INFO: chalk.blue,
	WARN: chalk.yellow,
	ERROR: chalk.red,
};

const isNode = !global.window;
const Logger = Log.noConflict() as Log.Logger;
Logger.enableAll();

LoggerPrefixPlugin.reg(Log);

if (isNode) {
	LoggerPrefixPlugin.apply(Logger, {
		format(level, name, timestamp) {
			const levelString = colors[level.toUpperCase()](level);
			return `[${chalk.gray(`${timestamp}`)}] [${levelString}]`;
		},
	});
}

export { Logger };
