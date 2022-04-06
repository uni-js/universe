import { Server } from './server';

function bootstrap() {
	const server = new Server('./data/');
	server.listen(6100);
}

bootstrap();
