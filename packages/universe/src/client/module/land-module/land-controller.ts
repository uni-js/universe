import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { Vector2 } from '../../../server/shared/math';
import { LandManager } from './land-manager';
import { LandObject } from './land-object';
import { TextureProvider } from '@uni.js/texture';

import * as ServerEvents from '../../../server/event/external';
import { HandleExternalEvent } from '@uni.js/event';
import { ClientSideController } from '@uni.js/client';
import { Logger } from '@uni.js/utils';

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
		Logger.info(`add new land:(${event.landPosX},${event.landPosY})`, event);
	}

	@HandleExternalEvent(ServerEvents.LandNeverUsedEvent)
	private handleLandRemoved(event: ServerEvents.LandNeverUsedEvent) {
		const land = this.landManager.getObjectById(event.landId);
		this.landManager.removeGameObject(land);
		Logger.info(`remove land:(${event.landPosX},${event.landPosY})`, event);
	}
}
