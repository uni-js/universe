import 'reflect-metadata';
import 'threads/register';

import { ConnectionController } from './controllers/connection-controller';
import { ServerApp } from '@uni.js/server';
import { createPersistDatabase, PersistDatabaseSymbol } from './database';

import { createServerSideModule } from '@uni.js/server';
import { MemoryDatabasePlugin } from '@uni.js/database';

import { ActorFactory } from './entity/actor-entity';
import { actorFactory } from './factory/actor';

import DotEnv from 'dotenv';
import { GameModule } from './module';

DotEnv.config();

process.on('uncaughtException', (err) => {
	console.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
	console.error('unhandledRejection', err);
});

function bootstrap() {
	const dbLocation = process.env.DB_LOCATION;
	if (Boolean(dbLocation) === false) throw new Error(`please provide env: DB_LOCATION`);

	const pdb = createPersistDatabase(dbLocation);

	const appModule = createServerSideModule({
		imports: [GameModule],
		controllers: [ConnectionController],
		providers: [
			{ key: ActorFactory, value: actorFactory },
			{ key: PersistDatabaseSymbol, value: pdb },
		],
	});

	const app = new ServerApp({
		port: 6100,
		module: appModule,
	});

	app.use(MemoryDatabasePlugin());
	app.start();
}

bootstrap();
