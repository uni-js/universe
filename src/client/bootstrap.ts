import 'reflect-metadata';

import PIXI from 'pixi.js';

import { Logger } from '@uni.js/utils';
import { GameClientApp } from './client-app';

export async function bootstrap() {
	const textureList = JSON.parse(process.env.UNI_TEXTURE_LIST);
	const serverUrl = 'http://127.0.0.1:6100/';

	const app = new GameClientApp(serverUrl, textureList, document.getElementById('playground'));

	app.start();
	Logger.info('Server URL is: ', serverUrl);
}

bootstrap();
