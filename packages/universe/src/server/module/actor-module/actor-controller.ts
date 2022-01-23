import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ActorManager } from './actor-manager';
import { PlayerManager } from '../player-module/player-manager';
import { LandManager } from '../land-module/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../../client/event';

import * as ExternalEvents from '../../event';
import { HandleRemoteEvent } from '@uni.js/event';
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

		this.redirectToBusEvent(this.actorManager, "ActorDamagedEvent", ExternalEvents.ActorDamagedEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, "ActorToggleUsingEvent", ExternalEvents.ActorToggleUsingEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, "ActorSetAttachmentEvent", ExternalEvents.ActorSetAttachmentEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, "ActorRemoveAttachmentEvent", ExternalEvents.ActorRemoveAttachmentEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, "NewWalkStateEvent", ExternalEvents.NewWalkStateEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, "NewPosEvent", ExternalEvents.NewPosEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, "ActorSetRotationEvent", ExternalEvents.ActorSetRotationEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);
	}

	@HandleRemoteEvent(ClientEvents.ActorToggleUsingEvent)
	private handleActorToggleUsingEvent(connId: string, event: ClientEvents.ActorToggleUsingEvent) {
		if (event.startOrEnd) {
			this.actorManager.startUsing(event.actorId);
		} else {
			this.actorManager.endUsing(event.actorId);
		}
	}

	private getSpawnedActorConnIds(actorId: number) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => player.spawnedActors.has(actorId))
			.map((player) => player.connId);
		return sids;
	}
}
