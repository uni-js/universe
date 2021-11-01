import 'reflect-metadata';

import { ClientApp } from '../framework/client-app';
import { ActorManager } from './manager/actor-manager';
import { LandManager } from './manager/land-manager';
import { CursorManager } from './manager/cursor-manager';
import { PlayerManager } from './manager/player-manager';
import { ShortcutManager } from './manager/shortcut-manager';
import { BowManager } from './manager/bow-manager';
import { PickDropManager } from './manager/pick-drop-manager';

import { ActorController } from './controller/actor-controller';
import { BootController } from './controller/boot-controller';
import { LandController } from './controller/land-controller';
import { PlayerController } from './controller/player-controller';
import { ShortcutController } from './controller/shortcut-controller';
import { PickDropController } from './controller/pick-drop-controller';

import { ActorStore, LandStore } from './store';

import { GameUI } from './ui/component/game-ui';
import { ActorFactory } from './object/actor';
import { ActorMapper } from './object';
import { HTMLInputProvider } from './input';

import { UIStates } from './ui/state';

export function bootstrap() {
	const playground = document.getElementById('playground') as HTMLDivElement;
	const texturePaths = JSON.parse(process.env.TEXTURE_LOADED);
	const serverUrl = process.env.UNIVERSE_SERVER_URL;

	const stores = [LandStore, ActorStore];
	const managers = [ActorManager, LandManager, CursorManager, PlayerManager, ShortcutManager, BowManager, PickDropManager];
	const controllers = [ActorController, BootController, LandController, PlayerController, ShortcutController, PickDropController];

	const app = new ClientApp({ serverUrl, playground, texturePaths, managers, stores, controllers, uiEntry: GameUI, uiStates: UIStates });

	for (const store of stores) {
		app.bindToValue(store, new store());
		app.addDisplayObject(app.get<any>(store).container);
	}

	const actorFactory = new ActorFactory();
	actorFactory.addImpls(ActorMapper);
	app.bindToValue(ActorFactory, actorFactory);

	const inputProvider = new HTMLInputProvider(app.getCanvasElement());
	app.bindToValue(HTMLInputProvider, inputProvider);

	app.addTicker(() => inputProvider.doTick());

	console.log('Server URL is: ', serverUrl);

	app.start();
}

bootstrap();
