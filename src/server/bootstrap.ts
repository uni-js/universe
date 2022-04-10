import { Server } from './server';

function bootstrap() {
	const server = new Server('./data/');
	server.listen(6100);
}

bootstrap();

process.on('uncaughtException', (err) => {
	console.error("uncaughtException" , err);
})

process.on('unhandledRejection', (err) => {
	console.error("unhandledRejection" , err);
})
