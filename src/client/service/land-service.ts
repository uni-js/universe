import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { AddLandEvent, RemoveLandEvent } from '../../event/server-side';
import { Vector2 } from '../../server/shared/math';
import { LandManager } from '../manager/land-manager';
import { LandObject } from '../object/land';
import { TextureContainer } from '../texture';

@injectable()
export class LandService {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(LandManager) private landManager: LandManager,
		@inject(TextureContainer) private texture: TextureContainer,
	) {
		this.eventBus.on(AddLandEvent.name, this.handleLandAdded);
		this.eventBus.on(RemoveLandEvent.name, this.handleLandRemoved);
	}
	private handleLandAdded = (event: AddLandEvent) => {
		const pos = new Vector2(event.landX, event.landY);
		const land = new LandObject(event.landData, this.texture, event.entityId, pos);
		this.landManager.addLand(land);
	};
	private handleLandRemoved = (event: RemoveLandEvent) => {
		const land = this.landManager.getLandById(event.entityId)!;
		this.landManager.removeLand(land);
	};
}
