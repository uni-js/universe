import 'reflect-metadata';
import { ClientApp } from './client-app';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);

	const app = new ClientApp('ws://127.0.0.1:7000/', playground, texturePaths);

	app.start();
}

bootstrap();
