import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { AddLandEvent, RemoveLandEvent } from '../../event/server-side';
import { Vector2 } from '../../server/shared/math';
import { LandManager } from '../manager/land-manager';
import { LandObject } from '../object/land';
import { TextureProvider } from '../texture';

@injectable()
export class LandService {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(LandManager) private landManager: LandManager,
		@inject(TextureProvider) private texture: TextureProvider,
	) {
		this.eventBus.on(AddLandEvent.name, this.handleLandAdded);
		this.eventBus.on(RemoveLandEvent.name, this.handleLandRemoved);
	}
	private handleLandAdded = (event: AddLandEvent) => {
		const pos = new Vector2(event.landX, event.landY);
		const land = new LandObject(this.texture, event.landData, event.entityId, pos);
		this.landManager.addGameObject(land);
	};

	private handleLandRemoved = (event: RemoveLandEvent) => {
		const land = this.landManager.getObjectById(event.entityId);
		this.landManager.removeGameObject(land);
	};
}
