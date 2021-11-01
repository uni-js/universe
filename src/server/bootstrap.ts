import 'reflect-metadata';
import 'threads/register';

import { ActorManager } from './manager/actor-manager';
import { PlayerManager } from './manager/player-manager';
import { LandMoveManager } from './manager/land-move-manager';
import { LandManager } from './manager/land-manager';
import { BowManager } from './manager/bow-manager';
import { InventoryManager } from './manager/inventory-manager';
import { LandLoadManager } from './manager/land-load-manager';

import { ActorController } from './controller/actor-controller';
import { PlayerController } from './controller/player-controller';
import { ConnectionController } from './controller/connection-controller';
import { LandController } from './controller/land-controller';
import { InventoryController } from './controller/inventory-controller';
import { PickDropController } from './controller/pick-drop-controller';

import { Land } from './entity/land';
import { InventoryEntities } from './entity/inventory';
import { Brick } from './entity/brick';
import { Actor, ActorFactory } from './actor/spec';
import { ActorMapper } from './actor/mapper';
import { ItemDef } from './item';
import { ServerApp } from '../framework/server-app';
import { createPersistDatabase, PersistDatabaseSymbol } from './database';

import DotEnv from 'dotenv';

DotEnv.config();

if (process.env.DEBUG) {
	console.warn('调试模式已启动');
}

process.on('uncaughtException', (err) => {
	console.error('uncaughtException', err);
});
process.on('unhandledRejection', (err) => {
	console.error('unhandledRejection', err);
});

function bootstrap() {
	const dbLocation = process.env.DB_LOCATION;
	if (Boolean(dbLocation) === false) throw new Error(`please provide env: DB_LOCATION`);

	const entities = [Land, Actor, Brick, ItemDef, ...InventoryEntities];
	const managers = [LandManager, ActorManager, PlayerManager, LandMoveManager, LandLoadManager, BowManager, InventoryManager];
	const controllers = [ActorController, PlayerController, ConnectionController, LandController, InventoryController, PickDropController];

	const app = new ServerApp({
		port: 6100,
		entities,
		managers,
		controllers,
	});

	const actorFactory = new ActorFactory();
	actorFactory.addImpls(ActorMapper);

	app.bindToValue(ActorFactory, actorFactory);

	const pdb = createPersistDatabase(dbLocation);
	app.bindToValue(PersistDatabaseSymbol, pdb);

	app.start();
}

bootstrap();
