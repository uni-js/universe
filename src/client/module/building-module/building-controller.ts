import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

import * as ServerEvents from '../../../server/event/external';

import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../../framework/client-side/bus-client';
import { HandleExternalEvent } from '../../../framework/event';
import { ClientSideController } from '../../../framework/client-side/client-controller';
import { BuildingManager } from './building-manager';

@injectable()
export class BuildingController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(BuildingManager) private buildingManager: BuildingManager) {
		super(eventBus);
	}

	@HandleExternalEvent(ServerEvents.UpdateBuildingNearbyEvent)
	private handleUpdateBuildingNearbyEvent(event: ServerEvents.UpdateBuildingNearbyEvent) {
		this.buildingManager.setBuildingsNearby(event.buildings);
	}
}
