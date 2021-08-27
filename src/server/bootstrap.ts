import 'reflect-metadata';
import 'threads/register';

import { ServerApp } from './server-app';
import DotEnv from 'dotenv';

DotEnv.config();

if (process.env.DEBUG) {
	console.warn('调试模式已启动');
}

new ServerApp({
	port: 7000,
});

process.on('uncaughtException', (err) => {
	console.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
	console.error('unhandledRejection', err);
});
