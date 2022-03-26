import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ActorMgr } from '../managers/actor-manager';
import { PlayerMgr } from '../managers/player-manager';
import { LandMgr } from '../managers/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../client/event';

import * as ExternalEvents from '../event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { ServerSideController } from '@uni.js/server';

@injectable()
export class ActorController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,

		@inject(ActorMgr) private actorMgr: ActorMgr,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(LandMgr) private landMgr: LandMgr,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('actorMgr', 'NewPosEvent')
	@EmitLocalEvent('actorMgr', 'NewWalkStateEvent')
	@EmitLocalEvent('actorMgr', 'ActorSetAttachmentEvent')
	@EmitLocalEvent('actorMgr', 'ActorRemoveAttachmentEvent')
	@EmitLocalEvent('actorMgr', 'ActorSetRotationEvent')
	@EmitLocalEvent('actorMgr', 'ActorDamagedEvent')
	private emitByActorId(ev: any) {
		const sids = this.playerMgr
			.getAllEntities()
			.filter((player) => player.spawnedActors.has(ev.actorId))
			.map((player) => player.connId);
		return sids;
	}
}
