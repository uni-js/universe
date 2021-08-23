import { EventBus } from '../event/bus-server';
import { Actor, BuildActorHash } from './shared/entity';
import { BuildPlayerHash, Player } from './entity/player';
import { ActorManager } from './manager/actor-manager';
import { PlayerManager } from './manager/player-manager';
import { LandMoveManager } from './manager/land-move-manager';
import { ActorService } from './service/actor-service';
import { PlayerService } from './service/player-service';

import { wait } from './shared/utils';
import { IndexedStore, MapStore, SetStore } from '../shared/store';
import { LandManager } from './manager/land-manager';
import { BuildLandHash, Land } from './entity/land';
import { ConnectionService } from './service/connection-service';
import { createDatabase, DatabaseSymbol, IDatabase } from './database';
import { LandService } from './service/land-service';

import { BrickFactory } from './entity/brick/brick';
import { BrickType } from './entity/brick/types';
import { Dirt, DryDirt, Grass, Ice, Rock, Sand, Water, WetDirt } from './entity/brick/group';
import { Container } from 'inversify';
import { bindToContainer } from '../client/shared/ioc';
import { ActorStore, LandStore, PlayerStore } from './shared/store';
import { Manager } from './shared/manager';

export interface AppConfig {
	port: number;
}

export class ServerApp {
	private db: IDatabase | undefined;

	private brickFactory!: BrickFactory;

	private stores: any[] = [];
	private managers: any[] = [];
	private services: any[] = [];

	private eventBus = new EventBus();
	private iocContainer!: Container;

	private config: AppConfig;

	private tick = 0;

	constructor(config: AppConfig) {
		this.config = config;

		this.stores = [ActorStore, LandStore, PlayerStore];

		this.managers = [LandManager, ActorManager, PlayerManager, LandMoveManager];

		this.services = [ActorService, PlayerService, ConnectionService, LandService];
		this.initBrickFactory();
		this.initDatabase();
		this.initEventBus();
		this.initIocContainer();
		this.startLoop();
	}
	private initBrickFactory() {
		this.brickFactory = new BrickFactory();
		this.brickFactory.setImpl(BrickType.DIRT, Dirt);
		this.brickFactory.setImpl(BrickType.DRY_DIRT, DryDirt);
		this.brickFactory.setImpl(BrickType.GRASS, Grass);
		this.brickFactory.setImpl(BrickType.ICE, Ice);
		this.brickFactory.setImpl(BrickType.ROCK, Rock);
		this.brickFactory.setImpl(BrickType.SAND, Sand);
		this.brickFactory.setImpl(BrickType.WATER, Water);
		this.brickFactory.setImpl(BrickType.WET_DIRT, WetDirt);
	}
	private initDatabase() {
		this.db = createDatabase(process.env.DB_LOCATION!);
	}
	private initEventBus() {
		this.eventBus.listen(this.config.port);
	}

	private initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(DatabaseSymbol).toConstantValue(this.db);
		ioc.bind(BrickFactory).toConstantValue(this.brickFactory);
		ioc.bind(EventBus).toConstantValue(this.eventBus);

		bindToContainer(ioc, [...this.stores, ...this.managers, ...this.services]);

		this.iocContainer = ioc;
	}

	private async startLoop() {
		while (true) {
			for (const manager of this.managers) {
				const singleton: Manager = this.iocContainer.get(manager);
				await singleton.doTick(this.tick);
			}
			for (const service of this.services) {
				const singleton: Manager = this.iocContainer.get(service);
				await singleton.doTick(this.tick);
			}

			await wait(50);

			this.tick += 1;
		}
	}
}
