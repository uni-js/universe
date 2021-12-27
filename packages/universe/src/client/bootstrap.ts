import 'reflect-metadata';

import { ClientApp, createClientSideModule, PlaygroundSymbol } from '@uni.js/client';
import { Viewport, ViewportHTMLEventDispatcher } from "@uni.js/viewport";
import { BootController } from './controller/boot-controller';

import { ActorLayer, BuildingCreatorLayer, LandLayer } from './store';

import { GameUI } from './ui/game-ui';
import { HTMLInputProvider } from './input';

import { LandModule } from './module/land-module/module-export';
import { ActorModule } from './module/actor-module/module-export';
import { PlayerModule } from './module/player-module/module-export';
import { InventoryModule } from './module/inventory-module/module-export';
import { BowModule } from './module/bow-module/module-export';
import { BuildingModule } from './module/building-module/module-export';
import { Logger } from '@uni.js/utils';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;
	const inputProvider = new HTMLInputProvider();

	const worldWidth = 4 * 7;
	const worldHeight = 3 * 7;
	const resolution = 32;

	const viewport = new Viewport(worldWidth * resolution, worldHeight * resolution, worldWidth, worldHeight);
	const viewportEventDispatcher = new ViewportHTMLEventDispatcher(viewport);

	const appModule = createClientSideModule({
		imports: [LandModule, ActorModule, PlayerModule, InventoryModule, BowModule, BuildingModule],
		controllers: [BootController],
		providers: [
			{ key: LandLayer, value: new LandLayer() },
			{ key: ActorLayer, value: new ActorLayer() },
			{ key: BuildingCreatorLayer, value: new BuildingCreatorLayer() },
			{ key: HTMLInputProvider, value: inputProvider },
			{ key: Viewport, value: viewport },
			{ key: ViewportHTMLEventDispatcher, value: viewportEventDispatcher },
			{ key: PlaygroundSymbol, value: playground },
		],
	});

	const app = new ClientApp({
		serverUrl,
		playground,
		texturePaths,
		uiEntry: GameUI,
		module: appModule,
		width: worldWidth,
		height: worldHeight,
		resolution,
	});

	const mouseElem = app.getCanvasContainer();
	inputProvider.bind(mouseElem);
	viewportEventDispatcher.bind(mouseElem);

	viewport.addChild(app.get(LandLayer).container);
	viewport.addChild(app.get(BuildingCreatorLayer).container);
	viewport.addChild(app.get(ActorLayer).container);

	app.addDisplayObject(viewport);
	app.addTicker(() => inputProvider.doFixedUpdateTick());

	Logger.info('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
