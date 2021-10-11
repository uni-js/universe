import 'reflect-metadata';
import { ClientApp } from './client-app';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;
	const app = new ClientApp(serverUrl, playground, texturePaths);

	console.log('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
