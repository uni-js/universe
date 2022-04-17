import { ClientApp, EventBusClient } from '@uni.js/client';
import { TextureModule, TexturePlugin, TextureProvider } from '@uni.js/texture';
import { UIEventBus, UIPlugin, UIStateContainer } from '@uni.js/ui';
import { HTMLInputPlugin, HTMLInputProvider } from '@uni.js/html-input';
import { Viewport, ViewportPlugin } from '@uni.js/viewport';
import { ActorManager } from './actor/actor-manager';
import { GameUI } from './components/game-ui';
import { BackpackContainerState, ShortcutContainerState } from './ui-states/container';
import { PlayerState } from './ui-states/player';
import { AttachUsingState } from './ui-states/using';
import { PlayerManager } from './player/player-manager';
import { World } from './world/world';
import { ContainerManager } from './container';
import { BuildingManager } from './building/building-manager';
import { Container } from 'pixi.js';

export class GameClientApp {
	public uni: ClientApp;
	public uiStates: UIStateContainer;
	public uiEventBus: UIEventBus;
	public textureProvider: TextureProvider;
	public inputProvider: HTMLInputProvider;
	public eventBus: EventBusClient;
	public actorManager: ActorManager;
	public playerManager: PlayerManager;
	public world: World;
	public viewport: Viewport;
	public containerManager: ContainerManager;
	public buildingManager: BuildingManager;

	public secondLayer = new Container();

	private tick = 0;
	private worldWidth = 84;
	private worldHeight = 45;
	private resolution = 32;

	constructor(serverUrl: string, private textureModules: TextureModule[], playground: HTMLElement) {
		this.uni = new ClientApp({
			width: this.worldWidth,
			height: this.worldHeight,
			resolution: this.resolution,
			serverUrl,
			playground,
			msgPacked: false,
		});
	}

	async start() {
		console.log('texture module', this.textureModules);
		const textureProvider = await this.uni.use(TexturePlugin({ imports: this.textureModules }));
		const uiStateDefs = [BackpackContainerState, ShortcutContainerState, PlayerState, AttachUsingState];
		const { uiStates, uiEventBus } = await this.uni.use(UIPlugin(GameUI, uiStateDefs, textureProvider));
		const inputProvider = await this.uni.use(HTMLInputPlugin());
		const { viewport } = await this.uni.use(
			ViewportPlugin({
				screenWidth: this.resolution * this.worldWidth,
				screenHeight: this.resolution * this.worldHeight,
				worldWidth: this.worldWidth,
				worldHeight: this.worldHeight,
			}),
		);

		this.uiStates = uiStates;
		this.uiEventBus = uiEventBus;
		this.textureProvider = textureProvider;
		this.inputProvider = inputProvider;
		this.viewport = viewport;

		this.eventBus = this.uni.getBusClient();

		this.world = new World(this);
		this.actorManager = new ActorManager(this);
		this.playerManager = new PlayerManager(this);
		this.containerManager = new ContainerManager(this);
		this.buildingManager = new BuildingManager(this);

		this.uni.start();
		this.uni.addTicker(() => this.doTick());
		this.playerManager.login();
	}

	getPlayer() {
		return this.playerManager.getPlayer();
	}

	doTick() {
		this.actorManager.doTick(this.tick);
		this.playerManager.doTick(this.tick);
		this.buildingManager.doTick(this.tick);
		this.containerManager.doTick();
		this.tick++;
	}

	emitEvent(event: any) {
		this.eventBus.emitBusEvent(event);
	}
}
