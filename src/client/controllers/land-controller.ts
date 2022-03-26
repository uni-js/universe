import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { Vector2 } from '../../server/utils/math';
import { LandMgr } from '../managers/land-manager';
import { LandObject } from '../objects/land-object';
import { TextureProvider } from '@uni.js/texture';

import * as ServerEvents from '../../server/event';
import { HandleRemoteEvent } from '@uni.js/event';
import { ClientSideController } from '@uni.js/client';
import { Logger } from '@uni.js/utils';

@injectable()
export class LandController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(LandMgr) private landMgr: LandMgr,
		@inject(TextureProvider) private texture: TextureProvider,
	) {
		super(eventBus);
	}

	@HandleRemoteEvent(ServerEvents.LandDataToPlayerEvent)
	private handleLandAdded(event: ServerEvents.LandDataToPlayerEvent) {
		const pos = new Vector2(event.landPosX, event.landPosY);
		const land = new LandObject(this.texture, event.landData, event.landId, pos);
		this.landMgr.addGameObject(land);
		Logger.info(`add new land:(${event.landPosX},${event.landPosY})`, event);
	}

	@HandleRemoteEvent(ServerEvents.LandNeverUsedEvent)
	private handleLandRemoved(event: ServerEvents.LandNeverUsedEvent) {
		const land = this.landMgr.getObjectById(event.landId);
		this.landMgr.removeGameObject(land);
		Logger.info(`remove land:(${event.landPosX},${event.landPosY})`, event);
	}
}
