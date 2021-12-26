import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ActorManager } from './actor-manager';
import { PlayerManager } from '../player-module/player-manager';
import { LandManager } from '../land-module/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../../client/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { HandleExternalEvent } from '@uni.js/event';
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

		this.redirectToBusEvent(this.actorManager, Events.ActorDamagedEvent, ExternalEvents.ActorDamagedEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorToggleUsingEvent, ExternalEvents.ActorToggleUsingEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorSetAttachmentEvent, ExternalEvents.ActorSetAttachmentEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorRemoveAttachmentEvent, ExternalEvents.ActorRemoveAttachmentEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.NewWalkStateEvent, ExternalEvents.NewWalkStateEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.NewPosEvent, ExternalEvents.NewPosEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorSetRotationEvent, ExternalEvents.ActorSetRotationEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);
	}

	@HandleExternalEvent(ClientEvents.ActorToggleUsingEvent)
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
			.filter((player) => this.playerManager.hasAtRecord(player, 'spawnedActors', actorId))
			.map((player) => player.connId);
		return sids;
	}
}
