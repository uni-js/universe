import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { Vector2 } from '../../server/shared/math';
import { LandManager } from '../manager/land-manager';
import { LandObject } from '../object/land';
import { TextureProvider } from '../texture';

import * as ServerEvents from '../../server/event/external';
import { HandleExternalEvent } from '../../event/spec';
import { GameController } from '../system/controller';

@injectable()
export class LandController extends GameController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(LandManager) private landManager: LandManager,
		@inject(TextureProvider) private texture: TextureProvider,
	) {
		super(eventBus);
	}

	@HandleExternalEvent(ServerEvents.AddLandEvent)
	private handleLandAdded(event: ServerEvents.AddLandEvent) {
		const pos = new Vector2(event.landX, event.landY);
		const land = new LandObject(this.texture, event.landData, event.actorId, pos);
		this.landManager.addGameObject(land);
		console.log(`add new land:(${event.landX},${event.landY})`, event);
	}

	@HandleExternalEvent(ServerEvents.RemoveLandEvent)
	private handleLandRemoved = (event: ServerEvents.RemoveLandEvent) => {
		const land = this.landManager.getObjectById(event.actorId);
		this.landManager.removeGameObject(land);
		console.log(`remove land:(${event.landX},${event.landY})`, event);
	};
}
