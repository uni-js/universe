import 'reflect-metadata';

import { ClientApp, createClientSideModule } from '@uni.js/client';
import { UIPlugin } from '@uni.js/ui';
import { ViewportPlugin } from "@uni.js/viewport";
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
import { TexturePlugin } from '@uni.js/texture';

export async function bootstrap() {
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;

	const worldWidth = 4 * 7;
	const worldHeight = 3 * 7;
	const resolution = 32;

	const appModule = createClientSideModule({
		imports: [LandModule, ActorModule, PlayerModule, InventoryModule, BowModule, BuildingModule],
		controllers: [BootController],
		providers: [
			{ key: LandLayer, value: new LandLayer() },
			{ key: ActorLayer, value: new ActorLayer() },
			{ key: BuildingCreatorLayer, value: new BuildingCreatorLayer() },
		],
	});

	const app = new ClientApp({
		serverUrl,
		playground: document.getElementById('playground'),
		module: appModule,
		width: worldWidth,
		height: worldHeight,
		resolution,
	});

	const mouseElem = app.getCanvasContainer();
	const inputProvider = new HTMLInputProvider();
	inputProvider.bind(mouseElem);
	app.add(HTMLInputProvider, inputProvider)
	app.addTicker(() => inputProvider.doFixedUpdateTick());

	await app.use(TexturePlugin(texturePaths));
	await app.use(UIPlugin(GameUI));
	await app.use(ViewportPlugin({
		screenWidth: resolution * worldWidth,
		screenHeight: resolution * worldHeight,
		worldWidth,
		worldHeight,
		initLayers: [
			app.get(LandLayer).container,
			app.get(BuildingCreatorLayer).container,
			app.get(ActorLayer).container
		]
	}))

	Logger.info('Server URL is: ', serverUrl);

	app.start();

}

bootstrap();
