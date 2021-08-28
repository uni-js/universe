import * as PIXI from 'pixi.js';

import { HTMLInputProvider } from './input';
import { ActorManager } from './manager/actor-manager';
import { TextureManager } from './texture';
import { EventBusClient } from '../event/bus-client';
import { Viewport } from './viewport';
import { LandManager } from './manager/land-manager';
import { Container } from 'inversify';
import { ActorContainer, ActorStore, BrickContainer, DataStore, LandStore, ObjectContainer, UiContainer, UiStore } from './shared/store';
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

	private textureManager = new TextureManager();

	private viewport: Viewport;
	private busClient: EventBusClient;
	private inputProvider: HTMLInputProvider;

	private iocContainer!: Container;
	private resolution = 32;

	//比例4:3
	private worldWidth = 4 * 7;
	private worldHeight = 3 * 7;

	constructor(private serverUrl: string, private canvas: HTMLCanvasElement) {
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
	}
	initIocContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });

		ioc.bind(HTMLInputProvider).toConstantValue(this.inputProvider);
		ioc.bind(EventBusClient).toConstantValue(this.busClient);
		ioc.bind(Viewport).toConstantValue(this.viewport);
		ioc.bind(TextureManager).toConstantValue(this.textureManager);

		bindToContainer(ioc, [
			ActorStore,
			ObjectContainer,
			UiStore,
			LandStore,
			DataStore,
			UiContainer,
			ActorContainer,
			BrickContainer,
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

		this.startLoop();
		console.log('start');
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
		await this.textureManager.add('system.shadow', './texture/system/shadow.png');
		await this.textureManager.add('system.brick_highlight', './texture/system/brick_highlight.png');

		await this.textureManager.add('inventory.block_background', './texture/inventory/block_background.png');
		await this.textureManager.add('inventory.background', './texture/inventory/background.png');

		await this.textureManager.add('shortcut.shortcut_background', './texture/shortcut/shortcut_background.png');
		await this.textureManager.add('shortcut.block_background.normal', './texture/shortcut/block_background_normal.png');
		await this.textureManager.add('shortcut.block_background.highlight', './texture/shortcut/block_background_highlight.png');

		await this.textureManager.add('shortcut.block_embed_empty', './texture/shortcut/block_embed_empty.png');

		await this.textureManager.addJSON('actor.player', './texture/actor/player/player.json');
		await this.textureManager.add('brick.rock.normal', './texture/brick/rock/normal.png');
		await this.textureManager.add('brick.grass.normal', './texture/brick/grass/normal.png');
		await this.textureManager.add('brick.ice.normal', './texture/brick/ice/normal.png');
		await this.textureManager.add('brick.dirt.normal', './texture/brick/dirt/normal.png');
		await this.textureManager.add('brick.drydr.normal', './texture/brick/drydr/normal.png');
		await this.textureManager.add('brick.sand.normal', './texture/brick/sand/normal.png');
		await this.textureManager.add('brick.water.normal', './texture/brick/water/normal.png');
		await this.textureManager.add('brick.wetdr.normal', './texture/brick/wetdr/normal.png');
	}
}
