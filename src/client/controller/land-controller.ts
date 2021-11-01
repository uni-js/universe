import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../framework/bus-client';
import { Vector2 } from '../../server/shared/math';
import { LandManager } from '../manager/land-manager';
import { LandObject } from '../object/land';
import { TextureProvider } from '../../framework/texture';

import * as ServerEvents from '../../server/event/external';
import { HandleExternalEvent } from '../../framework/event';
import { ClientSideController } from '../../framework/client-controller';

@injectable()
export class LandController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(LandManager) private landManager: LandManager,
		@inject(TextureProvider) private texture: TextureProvider,
	) {
		super(eventBus);
	}

	@HandleExternalEvent(ServerEvents.LandDataToPlayerEvent)
	private handleLandAdded(event: ServerEvents.LandDataToPlayerEvent) {
		const pos = new Vector2(event.landPosX, event.landPosY);
		const land = new LandObject(this.texture, event.landData, event.landId, pos);
		this.landManager.addGameObject(land);
		console.log(`add new land:(${event.landPosX},${event.landPosY})`, event);
	}

	@HandleExternalEvent(ServerEvents.LandNeverUsedEvent)
	private handleLandRemoved(event: ServerEvents.LandNeverUsedEvent) {
		const land = this.landManager.getObjectById(event.landId);
		this.landManager.removeGameObject(land);
		console.log(`remove land:(${event.landPosX},${event.landPosY})`, event);
	};
}
