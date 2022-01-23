import * as ExternalEvents from '../../event';

import * as ServerEvents from '../../../server/event';

import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { HandleRemoteEvent } from '@uni.js/event';
import { ClientSideController } from '@uni.js/client';
import { BuildingManager } from './building-manager';

@injectable()
export class BuildingController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(BuildingManager) private buildingManager: BuildingManager) {
		super(eventBus);
	}

	@HandleRemoteEvent(ServerEvents.UpdateBuildingNearbyEvent)
	private handleUpdateBuildingNearbyEvent(event: ServerEvents.UpdateBuildingNearbyEvent) {
		this.buildingManager.setBuildingsNearby(event.buildings);
	}
}
