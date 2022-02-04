import 'reflect-metadata';
import 'threads/register';

import { ConnectionController } from './controller/connection-controller';
import { ServerApp } from '@uni.js/server';
import { createPersistDatabase, PersistDatabaseSymbol } from './database';

import { createServerSideModule } from '@uni.js/server';
import { MemoryDatabasePlugin } from '@uni.js/database';

import { LandModule } from './module/land-module/module-export';
import { ActorModule } from './module/actor-module/module-export';
import { PlayerModule } from './module/player-module/module-export';
import { BowModule } from './module/tool-module/module-export';
import { InventoryModule } from './module/inventory-module/module-export';
import { PickDropModule } from './module/pick-drop-module/module-export';
import { actorFactory } from './module/actor-module/mapper';
import { ActorFactory } from './module/actor-module/actor-entity';

import DotEnv from 'dotenv';

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
		imports: [LandModule, ActorModule, PlayerModule, BowModule, InventoryModule, PickDropModule],
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
