import { DelayedEventBus, EventBus, EventBusSymbol, IEventBus } from '../framework/bus-server';
import { ActorManager } from './manager/actor-manager';
import { PlayerManager } from './manager/player-manager';
import { LandMoveManager } from './manager/land-move-manager';
import { ActorController } from './controller/actor-controller';
import { PlayerController } from './controller/player-controller';

import { wait } from './utils';
import { LandManager } from './manager/land-manager';
import { ConnectionController } from './controller/connection-controller';
import { createPersistDatabase, PersistDatabaseSymbol, IPersistDatabase } from '../database';
import { LandController } from './controller/land-controller';

import { Container } from 'inversify';
import { bindToContainer } from '../framework/ioc';
import { Manager } from '../framework/server-manager';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase, MemoryDatabaseSymbol } from '../framework/memory-database';
import { Land } from './entity/land';
import { InventoryEntities } from './entity/inventory';
import { Brick } from './entity/brick';
import { ServerController } from '../framework/server-controller';
import { BowManager } from './manager/bow-manager';
import { InventoryManager } from './manager/inventory-manager';
import { InventoryController } from './controller/inventory-controller';
import { Actor, ActorFactory } from './actor/spec';
import { ItemDef } from './item';
import { ActorMapper } from './actor/mapper';
import { PickDropController } from './controller/pick-drop-controller';
import { GetIsServerUseDelay } from '../debug';
import { LandLoadManager } from './manager/land-load-manager';

export interface AppConfig {
	port: number;
	dbLocation: string;
}

export class ServerApp {
	private pdb: IPersistDatabase;
	private mdb: IMemoryDatabase;

	private entities: any[] = [];
	private managers: any[] = [];
	private controllers: any[] = [];

	private actorFactory: ActorFactory;

	private eventBus: IEventBus;
	private iocContainer: Container;

	private config: AppConfig;

	private tick = 0;

	constructor(config: AppConfig) {
		this.config = config;

		this.entities = [Land, Actor, Brick, ItemDef, ...InventoryEntities];
		this.managers = [LandManager, ActorManager, PlayerManager, LandMoveManager, LandLoadManager, BowManager, InventoryManager];
		this.controllers = [
			ActorController,
			PlayerController,
			ConnectionController,
			LandController,
			InventoryController,
			PickDropController,
		];

		this.initDatabase();
		this.initEventBus();
		this.initActoryFactory();
		this.initIocContainer();
		this.startLoop();
	}
	private initActoryFactory() {
		const factory = new ActorFactory();
		factory.addImpls(ActorMapper);

		this.actorFactory = factory;
	}
	private initDatabase() {
		this.pdb = createPersistDatabase(this.config.dbLocation);
		this.mdb = createMemoryDatabase(this.entities);
	}
	private initEventBus() {
		this.eventBus = GetIsServerUseDelay() ? new DelayedEventBus() : new EventBus();
		this.eventBus.listen(this.config.port);
	}

	private initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(PersistDatabaseSymbol).toConstantValue(this.pdb);
		ioc.bind(MemoryDatabaseSymbol).toConstantValue(this.mdb);

		ioc.bind(EventBusSymbol).toConstantValue(this.eventBus);
		ioc.bind(ActorFactory).toConstantValue(this.actorFactory);

		bindCollectionsTo(ioc, this.entities, this.mdb);
		bindToContainer(ioc, [...this.managers, ...this.controllers]);

		this.iocContainer = ioc;
	}

	private async startLoop() {
		console.log('the universe game server is running');

		while (true) {
			const startTime = new Date().getTime();
			for (const manager of this.managers) {
				const singleton: Manager = this.iocContainer.get(manager);
				singleton.doTick(this.tick);
			}
			for (const controller of this.controllers) {
				const singleton: ServerController = this.iocContainer.get(controller);
				singleton.doTick(this.tick);
			}
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
