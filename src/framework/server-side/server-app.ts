import { DelayedEventBus, EventBusServer, EventBusServerSymbol, IEventBus } from './bus-server';

import { Container } from 'inversify';
import { bindToContainer, resolveAllBindings } from '../inversify';
import { ServerSideManager } from './server-manager';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase, MemoryDatabaseSymbol } from './memory-database';
import { ServerSideController } from './server-controller';
import { GetIsServerUseDelay } from './debug';
import { EntityClass, Provider, resolveServerSideModule, ServerControllerClass, ServerManagerClass, ServerSideModule } from '../module';

function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export interface ServerApplicationOption {
	port: number;
	module: ServerSideModule;
}

export class ServerApp {
	private mdb: IMemoryDatabase;

	private entities: EntityClass[] = [];
	private managers: ServerManagerClass[] = [];
	private controllers: ServerControllerClass[] = [];
	private providers: Provider[] = [];

	private eventBus: IEventBus;
	private iocContainer: Container;

	private tick = 0;

	constructor(private option: ServerApplicationOption) {
		const moduleResolved = resolveServerSideModule(option.module);

		this.entities = moduleResolved.entities;
		this.managers = moduleResolved.managers;
		this.controllers = moduleResolved.controllers;
		this.providers = moduleResolved.providers;

		this.eventBus = GetIsServerUseDelay() ? new DelayedEventBus() : new EventBusServer();
		this.mdb = createMemoryDatabase(this.entities);

		this.initInversifyContainer();
	}

	start() {
		resolveAllBindings(this.iocContainer, this.managers);
		resolveAllBindings(this.iocContainer, this.controllers);

		this.eventBus.listen(this.option.port);
		this.startLoop();
	}

	private initInversifyContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(MemoryDatabaseSymbol).toConstantValue(this.mdb);
		ioc.bind(EventBusServerSymbol).toConstantValue(this.eventBus);

		bindCollectionsTo(ioc, this.entities, this.mdb);
		bindToContainer(ioc, [...this.managers, ...this.controllers]);

		for (const provider of this.providers) {
			ioc.bind(provider.key).toConstantValue(provider.value);
		}

		this.iocContainer = ioc;
	}

	private async startLoop() {
		console.log('the universe game server is running');

		while (true) {
			const startTime = new Date().getTime();

			try{
				for (const manager of this.managers) {
					const singleton: ServerSideManager = this.iocContainer.get(manager);
					singleton.doTick(this.tick);
				}
				for (const controller of this.controllers) {
					const singleton: ServerSideController = this.iocContainer.get(controller);
					singleton.doTick(this.tick);
				}	
			}catch(err){
				console.error(err.stack);
			}
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
