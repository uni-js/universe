import 'reflect-metadata';

import { ClientApp } from '../framework/client-side/client-app';
import { BootController } from './controller/boot-controller';

import { ActorStore, LandStore } from './store';

import { GameUI } from './ui/game-ui';
import { HTMLInputProvider } from './input';

import { createClientSideModule } from '../framework/module';
import { LandModule } from './module/land-module/module-export';
import { ActorModule } from './module/actor-module/module-export';
import { PlayerModule } from './module/player-module/module-export';
import { InventoryModule } from './module/inventory-module/module-export';
import { BowModule } from './module/bow-module/module-export';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;
	const inputProvider = new HTMLInputProvider(playground);

	const appModule = createClientSideModule({
		imports: [LandModule, ActorModule, PlayerModule, InventoryModule, BowModule],
		controllers: [BootController],
		providers: [
			{ key: LandStore, value: new LandStore() },
			{ key: ActorStore, value: new ActorStore() },
			{ key: HTMLInputProvider, value: inputProvider },
		],
	});

	const app = new ClientApp({ serverUrl, playground, texturePaths, uiEntry: GameUI, module: appModule });

	app.addTicker(() => inputProvider.doTick());
	app.addDisplayObject(app.get<any>(LandStore).container);
	app.addDisplayObject(app.get<any>(ActorStore).container);

	console.log('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
