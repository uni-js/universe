import * as PIXI from 'pixi.js';

import React from 'react';
import ReactDOM from 'react-dom';

import { HTMLInputProvider } from './input';
import { ActorManager } from './manager/actor-manager';
import { ParseTexturePath, TextureProvider, TextureType } from './texture';
import { EventBusClient } from '../event/bus-client';
import { Viewport } from './viewport';
import { LandManager } from './manager/land-manager';
import { Container } from 'inversify';
import { bindToContainer } from '../shared/ioc';
import { CursorManager } from './manager/cursor-manager';
import { PlayerManager } from './manager/player-manager';
import { ShortcutManager } from './manager/shortcut-manager';
import { ActorController } from './controller/actor-controller';
import { BootController } from './controller/boot-controller';
import { LandController } from './controller/land-controller';
import { PlayerController } from './controller/player-controller';
import { UIEntry } from './ui/entry';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase } from '../database/memory';
import { GameUI } from './ui/game-ui';

import { ActorStore, DataStore, DataStoreEntities, LandStore, UIEventBus } from './store';
import { ActorFactory } from './object/actor';
import { ActorMapper } from './object';
import { ShortcutController } from './controller/shortcut-controller';
import { BowManager } from './manager/bow-manager';
import { PickDropManager } from './manager/pick-drop-manager';
import { PickDropController } from './controller/pick-drop-controller';
import { ObjectStore } from '../shared/store';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;

export interface TextureDef {
	name: string;
	url: string;
}

export class ClientApp {
	private tick = 0;

	private app: PIXI.Application;

	private stores: any[] = [];
	private managers: any[] = [];
	private controllers: any[] = [];

	private textureProvider = new TextureProvider();

	private viewport: Viewport;
	private busClient: EventBusClient;
	private inputProvider: HTMLInputProvider;
	private dataStore: IMemoryDatabase;
	private uiEventBus: UIEventBus;

	private actorFactory: ActorFactory;

	private iocContainer!: Container;
	private resolution = 32;

	//比例4:3
	private worldWidth = 4 * 7;
	private worldHeight = 3 * 7;

	private wrapper: HTMLDivElement;
	private uiContainer: HTMLDivElement;

	constructor(private serverUrl: string, private playGround: HTMLDivElement, private texturePaths: string[]) {
		this.app = new PIXI.Application({
			resolution: this.resolution,
			width: this.worldWidth,
			height: this.worldHeight,
		});

		this.stores = [LandStore, ActorStore];
		this.managers = [ActorManager, LandManager, CursorManager, PlayerManager, ShortcutManager, BowManager, PickDropManager];
		this.controllers = [ActorController, BootController, LandController, PlayerController, ShortcutController, PickDropController];

		this.viewport = new Viewport(
			this.worldWidth * this.resolution,
			this.worldHeight * this.resolution,
			this.worldWidth,
			this.worldHeight,
		);
		this.busClient = new EventBusClient(this.serverUrl);
		this.inputProvider = new HTMLInputProvider(this.app.view);
		this.uiEventBus = new UIEventBus();

		this.dataStore = createMemoryDatabase(DataStoreEntities);

		this.initActorFactory();
		this.initWrapper();
		this.initUiContainer();
	}

	private initActorFactory() {
		this.actorFactory = new ActorFactory();

		this.actorFactory.addImpls(ActorMapper);
	}
	private initWrapper() {
		const wrapper = document.createElement('div');
		wrapper.classList.add('uni-wrapper');
		wrapper.style.width = `${this.app.view.width}px`;
		wrapper.style.height = `${this.app.view.height}px`;
		wrapper.style.position = 'relative';

		this.playGround.appendChild(wrapper);
		this.wrapper = wrapper;
	}
	private initUiContainer() {
		const container = document.createElement('div');
		container.classList.add('uni-ui-container');
		container.style.position = 'absolute';
		container.style.left = '0px';
		container.style.top = '0px';
		container.style.width = '100%';
		container.style.height = '100%';
		container.style.userSelect = 'none';
		container.style.pointerEvents = 'none';

		this.wrapper.appendChild(container);
		this.wrapper.appendChild(this.app.view);
		this.uiContainer = container;
	}
	initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(HTMLInputProvider).toConstantValue(this.inputProvider);
		ioc.bind(EventBusClient).toConstantValue(this.busClient);
		ioc.bind(Viewport).toConstantValue(this.viewport);
		ioc.bind(TextureProvider).toConstantValue(this.textureProvider);
		ioc.bind(DataStore).toConstantValue(this.dataStore);
		ioc.bind(UIEventBus).toConstantValue(this.uiEventBus);

		ioc.bind(ActorFactory).toConstantValue(this.actorFactory);

		bindCollectionsTo(ioc, DataStoreEntities, this.dataStore);

		bindToContainer(ioc, [...this.stores, ...this.managers, ...this.controllers]);

		const viewport = ioc.get(Viewport);

		for (const store of this.stores) {
			viewport.addChild(ioc.get<ObjectStore<any>>(store).container);
		}

		this.app.stage.addChild(viewport);

		this.iocContainer = ioc;
	}
	getCanvas() {
		return this.app.view;
	}
	async start() {
		await this.initTextures();
		this.initIocContainer();

		this.app.start();
		this.renderUI();
		this.startLoop();
	}
	private renderUI() {
		const dataSource = this.iocContainer.get(DataStore);
		const ticker = this.app.ticker;
		const eventBus = this.uiEventBus;
		const textureProvider = this.textureProvider;

		ReactDOM.render(
			React.createElement(UIEntry, { dataSource, ticker, eventBus, textureProvider }, React.createElement(GameUI)),
			this.uiContainer,
		);
	}
	private doTick() {
		this.iocContainer.get<HTMLInputProvider>(HTMLInputProvider).doTick();
		for (const manager of this.managers) {
			this.iocContainer.get<any>(manager).doTick(this.tick);
		}

		this.tick += 1;
	}
	private startLoop() {
		this.app.ticker.add(this.doTick.bind(this));
	}
	private async initTextures() {
		for (const path of this.texturePaths) {
			const parsed = ParseTexturePath(path);
			if (Boolean(parsed) === false) continue;
			const [key, relPath, type] = parsed;
			if (type == TextureType.IMAGESET) {
				await this.textureProvider.addJSON(key, relPath);
			} else {
				await this.textureProvider.add(key, relPath);
			}
		}
	}
}
