import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';
import { EmitLocalEvent } from '@uni.js/event';
import { PlayerManager } from '../player-module/player-manager';
import { inject, injectable } from 'inversify';
import { LandManager } from '../../module/land-module/land-manager';

import * as ExternalEvents from '../../event';

@injectable()
export class LandController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);

	}

	@EmitLocalEvent("playerManager", "LandNeverUsedEvent")
	@EmitLocalEvent("landManager", "LandDataToPlayerEvent")
	private emitToPlayer(ev: any) {
		return this.playerManager.getEntityById(ev.playerId).connId
	}
}
