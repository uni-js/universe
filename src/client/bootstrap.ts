import 'reflect-metadata';
import { ClientApp, createClientSideModule } from '@uni.js/client';

import { UIPlugin } from '@uni.js/ui';
import { ViewportPlugin } from '@uni.js/viewport';
import { HTMLInputPlugin } from '@uni.js/html-input';
import { TexturePlugin } from '@uni.js/texture';
import { Logger } from '@uni.js/utils';

import { GameUI } from './components/game-ui';
import { GameClientModule } from './module';

import { BootController } from './controllers/boot-controller';
import { ActorLayer, BuildingCreatorLayer, LandLayer } from './store';

export async function bootstrap() {
	const textureList = JSON.parse(process.env.UNI_TEXTURE_LIST);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;

	const worldWidth = 4 * 7;
	const worldHeight = 3 * 7;
	const resolution = 32;

	const appModule = createClientSideModule({
		imports: [GameClientModule],
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

	await app.use(HTMLInputPlugin());
	await app.use(
		TexturePlugin({
			imports: textureList,
		}),
	);
	await app.use(UIPlugin(GameUI));
	await app.use(
		ViewportPlugin({
			screenWidth: resolution * worldWidth,
			screenHeight: resolution * worldHeight,
			worldWidth,
			worldHeight,
			initLayers: [app.get(LandLayer).container, app.get(BuildingCreatorLayer).container, app.get(ActorLayer).container],
		}),
	);

	Logger.info('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
