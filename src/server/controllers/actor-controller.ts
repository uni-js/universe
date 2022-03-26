import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ActorManager } from '../managers/actor-manager';
import { PlayerManager } from '../managers/player-manager';
import { LandManager } from '../managers/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../client/event';

import * as ExternalEvents from '../event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { ServerSideController } from '@uni.js/server';

@injectable()
export class ActorController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,

		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('actorManager', 'NewPosEvent')
	@EmitLocalEvent('actorManager', 'NewWalkStateEvent')
	@EmitLocalEvent('actorManager', 'ActorSetAttachmentEvent')
	@EmitLocalEvent('actorManager', 'ActorRemoveAttachmentEvent')
	@EmitLocalEvent('actorManager', 'ActorSetRotationEvent')
	@EmitLocalEvent('actorManager', 'ActorDamagedEvent')
	private emitByActorId(ev: any) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => player.spawnedActors.has(ev.actorId))
			.map((player) => player.connId);
		return sids;
	}
}
