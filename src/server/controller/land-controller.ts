import { EventBus, EventBusSymbol } from '../../framework/bus-server';
import { ServerController } from '../../framework/server-controller';
import { PlayerManager } from '../manager/player-manager';
import { inject, injectable } from 'inversify';
import { LandManager } from '../manager/land-manager';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class LandController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.landManager,
			Events.LandDataToPlayerEvent,
			ExternalEvents.AddLandEvent,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
		this.redirectToBusEvent(
			this.playerManager,
			Events.LandNeverUsedEvent,
			ExternalEvents.RemoveLandEvent,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
	}
}
