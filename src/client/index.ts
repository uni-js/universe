import 'reflect-metadata';
import { ClientApp } from './client-app';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLCanvasElement;

	const app = new ClientApp('ws://127.0.0.1:7000/', playground);

	playground.appendChild(app.getCanvas());

	app.start();
}

bootstrap();
