import { EventBus } from '../event/bus-server';
import { ActorManager } from './manager/actor-manager';
import { PlayerManager } from './manager/player-manager';
import { LandMoveManager } from './manager/land-move-manager';
import { ActorService } from './service/actor-service';
import { PlayerService } from './service/player-service';

import { wait } from './utils';
import { LandManager } from './manager/land-manager';
import { ConnectionService } from './service/connection-service';
import { createPersistDatabase, PersistDatabaseSymbol, IPersistDatabase } from './database/persist';
import { LandService } from './service/land-service';

import { Container } from 'inversify';
import { bindToContainer } from '../client/shared/ioc';
import { Manager } from './shared/manager';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase, MemoryDatabaseSymbol } from './database/memory';
import { Land } from './entity/land';
import { Actor } from './shared/entity';
import { Inventory } from './entity/inventory';
import { Brick } from './entity/brick';
import { Service } from './shared/service';

export interface AppConfig {
	port: number;
}

export class ServerApp {
	private pdb: IPersistDatabase;
	private mdb: IMemoryDatabase;

	private entities: any[] = [];
	private managers: any[] = [];
	private services: any[] = [];

	private eventBus = new EventBus();
	private iocContainer!: Container;

	private config: AppConfig;

	private tick = 0;

	constructor(config: AppConfig) {
		this.config = config;

		this.entities = [Land, Actor, Brick, Inventory];
		this.managers = [LandManager, ActorManager, PlayerManager, LandMoveManager];
		this.services = [ActorService, PlayerService, ConnectionService, LandService];

		this.initDatabase();
		this.initEventBus();
		this.initIocContainer();
		this.startLoop();
	}
	private initDatabase() {
		this.pdb = createPersistDatabase(process.env.DB_LOCATION!);
		this.mdb = createMemoryDatabase(this.entities);
	}
	private initEventBus() {
		this.eventBus.listen(this.config.port);
	}

	private initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(PersistDatabaseSymbol).toConstantValue(this.pdb);
		ioc.bind(MemoryDatabaseSymbol).toConstantValue(this.mdb);

		ioc.bind(EventBus).toConstantValue(this.eventBus);

		bindCollectionsTo(ioc, this.entities, this.mdb);
		bindToContainer(ioc, [...this.managers, ...this.services]);

		this.iocContainer = ioc;
	}

	private async startLoop() {
		while (true) {
			const startTime = new Date().getTime();
			for (const manager of this.managers) {
				const singleton: Manager = this.iocContainer.get(manager);
				singleton.doTick(this.tick);
			}
			for (const service of this.services) {
				const singleton: Service = this.iocContainer.get(service);
				singleton.doTick(this.tick);
			}
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
