import { EventBusServer, EventBusServerSymbol } from '../../../framework/bus-server';
import { ServerSideController } from '../../../framework/server-controller';
import { PlayerManager } from '../player-module/player-manager';
import { inject, injectable } from 'inversify';
import { LandManager } from '../../module/land-module/land-manager';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

@injectable()
export class LandController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.landManager,
			Events.LandDataToPlayerEvent,
			ExternalEvents.LandDataToPlayerEvent,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
		this.redirectToBusEvent(
			this.playerManager,
			Events.LandNeverUsedEvent,
			ExternalEvents.LandNeverUsedEvent,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
	}
}
