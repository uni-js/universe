import 'reflect-metadata';

import { ClientApp } from '../framework/client-side/client-app';
import { BootController } from './controller/boot-controller';

import { ActorLayer, BuildingCreatorLayer, LandLayer } from './store';

import { GameUI } from './ui/game-ui';
import { HTMLInputProvider } from './input';

import { createClientSideModule } from '../framework/module';
import { LandModule } from './module/land-module/module-export';
import { ActorModule } from './module/actor-module/module-export';
import { PlayerModule } from './module/player-module/module-export';
import { InventoryModule } from './module/inventory-module/module-export';
import { BowModule } from './module/bow-module/module-export';
import { Logger } from '../framework/local-logger';
import { Viewport } from '../framework/client-side/viewport';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;
	const inputProvider = new HTMLInputProvider();

	const worldWidth = 4 * 7;
	const worldHeight = 3 * 7;
	const resolution = 32;

	const viewport = new Viewport(worldWidth * resolution, worldHeight * resolution, worldWidth, worldHeight);

	const appModule = createClientSideModule({
		imports: [LandModule, ActorModule, PlayerModule, InventoryModule, BowModule],
		controllers: [BootController],
		providers: [
			{ key: LandLayer, value: new LandLayer() },
			{ key: ActorLayer, value: new ActorLayer() },
			{ key: BuildingCreatorLayer, value: new BuildingCreatorLayer() },
			{ key: HTMLInputProvider, value: inputProvider },
			{ key: Viewport, value: viewport },
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

	inputProvider.bind(app.getCanvasContainer());

	viewport.addChild(app.get(LandLayer).container);
	viewport.addChild(app.get(ActorLayer).container);
	viewport.addChild(app.get(BuildingCreatorLayer).container);

	app.addDisplayObject(viewport);
	app.addTicker(() => inputProvider.doFixedUpdateTick());

	Logger.info('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
