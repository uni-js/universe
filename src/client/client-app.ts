import * as PIXI from 'pixi.js';

import React from 'react';
import ReactDOM from 'react-dom';

import { HTMLInputProvider } from './input';
import { ActorManager } from './manager/actor-manager';
import { ParseTexturePath, TextureContainer, TextureType } from './texture';
import { EventBusClient } from '../event/bus-client';
import { Viewport } from './viewport';
import { LandManager } from './manager/land-manager';
import { Container } from 'inversify';
import { bindToContainer } from './shared/ioc';
import { CursorManager } from './manager/cursor-manager';
import { DefaultSceneManager } from './manager/default-scene-manager';
import { InventoryManager } from './manager/inventory-manager';
import { PlayerManager } from './manager/player-manager';
import { ShortcutManager } from './manager/shortcut-manager';
import { ActorService } from './service/actor-service';
import { BootService } from './service/boot-service';
import { LandService } from './service/land-service';
import { PlayerService } from './service/player-service';
import { UIEntry } from './ui/entry';
import { bindCollectionsTo, createMemoryDatabase, IMemoryDatabase } from '../shared/database/memory';
import { GameUI } from './ui/game-ui';

import {
	ActorContainer,
	ActorStore,
	BrickContainer,
	DataStore,
	DataStoreEntities,
	LandStore,
	ObjectContainer,
	UiContainer,
	UIEventBus,
	UiStore,
} from './shared/store';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;

export interface TextureDef {
	name: string;
	url: string;
}

export class ClientApp {
	private tick = 0;

	private app: PIXI.Application;

	private managers: any[] = [];
	private services: any[] = [];

	private textureContainer = new TextureContainer();

	private viewport: Viewport;
	private busClient: EventBusClient;
	private inputProvider: HTMLInputProvider;
	private dataStore: IMemoryDatabase;
	private uiEventBus: UIEventBus;

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
		this.managers = [ActorManager, LandManager, CursorManager, DefaultSceneManager, InventoryManager, PlayerManager, ShortcutManager];
		this.services = [ActorService, BootService, LandService, PlayerService];

		this.viewport = new Viewport(
			this.worldWidth * this.resolution,
			this.worldHeight * this.resolution,
			this.worldWidth,
			this.worldHeight,
		);
		this.busClient = new EventBusClient(this.serverUrl);
		this.inputProvider = new HTMLInputProvider(this.app.view);
		this.dataStore = createMemoryDatabase(DataStoreEntities);
		this.uiEventBus = new UIEventBus();

		this.initWrapper();
		this.initUiContainer();
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
		ioc.bind(TextureContainer).toConstantValue(this.textureContainer);
		ioc.bind(DataStore).toConstantValue(this.dataStore);
		ioc.bind(UIEventBus).toConstantValue(this.uiEventBus);

		bindCollectionsTo(ioc, DataStoreEntities, this.dataStore);

		bindToContainer(ioc, [
			ObjectContainer,
			ActorContainer,
			BrickContainer,
			UiContainer,
			ActorStore,
			LandStore,
			UiStore,
			...this.managers,
			...this.services,
		]);

		const viewport = ioc.get(Viewport);

		const actorContainer = ioc.get(ActorContainer);
		const brickContainer = ioc.get(BrickContainer);
		const uiContainer = ioc.get(UiContainer);

		viewport.addChild(actorContainer);
		viewport.addChild(brickContainer);

		this.app.stage.addChild(viewport);
		this.app.stage.addChild(uiContainer);

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
		console.log('start');
	}
	private renderUI() {
		const dataSource = this.iocContainer.get(DataStore);
		const ticker = this.app.ticker;
		const eventBus = this.uiEventBus;

		ReactDOM.render(React.createElement(UIEntry, { dataSource, ticker, eventBus }, React.createElement(GameUI)), this.uiContainer);
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
				await this.textureContainer.addJSON(key, relPath);
			} else {
				await this.textureContainer.add(key, relPath);
			}
		}
	}
}
