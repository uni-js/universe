import { DelayedEventBus, EventBusServer, EventBusServerSymbol, IEventBus } from '../framework/bus-server';

import { Container, interfaces } from 'inversify';
import { bindToContainer, resolveAllBindings } from '../framework/inversify';
import { ServerSideManager } from '../framework/server-manager';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase, MemoryDatabaseSymbol } from '../framework/memory-database';
import { ServerSideController } from '../framework/server-controller';
import { GetIsServerUseDelay } from '../framework/debug';

function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export interface ServerApplicationOption {
	port: number;
	entities: any[];
	managers: any[];
	controllers: any[];
}

export class ServerApp {
	private mdb: IMemoryDatabase;

	private entities: any[] = [];
	private managers: any[] = [];
	private controllers: any[] = [];

	private eventBus: IEventBus;
	private iocContainer: Container;

	private tick = 0;

	constructor(private option: ServerApplicationOption) {
		this.entities = option.entities;
		this.managers = option.managers;
		this.controllers = option.controllers;

		this.eventBus = GetIsServerUseDelay() ? new DelayedEventBus() : new EventBusServer();
		this.mdb = createMemoryDatabase(this.entities);

		this.initIocContainer();
	}

	bindToValue<T>(identifier: interfaces.ServiceIdentifier<T>, value: T) {
		this.iocContainer.bind(identifier).toConstantValue(value);
	}

	start() {
		resolveAllBindings(this.iocContainer, this.managers);
		resolveAllBindings(this.iocContainer, this.controllers);

		this.eventBus.listen(this.option.port);
		this.startLoop();
	}

	private initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(MemoryDatabaseSymbol).toConstantValue(this.mdb);
		ioc.bind(EventBusServerSymbol).toConstantValue(this.eventBus);

		bindCollectionsTo(ioc, this.entities, this.mdb);
		bindToContainer(ioc, [...this.managers, ...this.controllers]);

		this.iocContainer = ioc;
	}

	private async startLoop() {
		console.log('the universe game server is running');

		while (true) {
			const startTime = new Date().getTime();
			for (const manager of this.managers) {
				const singleton: ServerSideManager = this.iocContainer.get(manager);
				singleton.doTick(this.tick);
			}
			for (const controller of this.controllers) {
				const singleton: ServerSideController = this.iocContainer.get(controller);
				singleton.doTick(this.tick);
			}
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
