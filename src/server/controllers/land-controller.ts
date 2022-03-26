import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';
import { EmitLocalEvent } from '@uni.js/event';
import { PlayerMgr } from '../managers/player-manager';
import { inject, injectable } from 'inversify';
import { LandMgr } from '../managers/land-manager';

import * as ExternalEvents from '../event';

@injectable()
export class LandController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(LandMgr) private landMgr: LandMgr,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('playerMgr', 'LandNeverUsedEvent')
	@EmitLocalEvent('landMgr', 'LandDataToPlayerEvent')
	private emitToPlayer(ev: any) {
		return this.playerMgr.getEntityById(ev.playerId).connId;
	}
}
