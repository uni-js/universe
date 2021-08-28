import 'reflect-metadata';
import { ClientApp } from './client-app';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;

	const app = new ClientApp('ws://127.0.0.1:7000/', playground);

	app.start();
}

bootstrap();
