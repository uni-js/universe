import 'reflect-metadata';
import 'threads/register';

import { ServerApp } from './server-app';
import DotEnv from 'dotenv';

DotEnv.config();

if (process.env.DEBUG) {
	console.warn('调试模式已启动');
}

process.on('uncaughtException', (err) => {
	console.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
	console.error('unhandledRejection', err);
});

function start() {
	const dbLocation = process.env.DB_LOCATION;
	if (Boolean(dbLocation) === false) throw new Error(`please provide env: DB_LOCATION`);

	new ServerApp({
		port: 6100,
		dbLocation,
	});
}

start();
