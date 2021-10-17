import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { LandManager } from '../manager/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { HandleExternalEvent } from '../../event/spec';
import { ServerController } from '../shared/controller';

@injectable()
export class ActorController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,

		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.actorManager, Events.ActorDamagedEvent, ExternalEvents.ActorDamagedEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorToggleUsingEvent, ExternalEvents.ActorToggleUsing, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorSetAttachment, ExternalEvents.ActorSetAttachment, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.ActorRemoveAttachment, ExternalEvents.ActorRemoveAttachment, (ev) =>
			this.getSpawnedActorConnIds(ev.targetActorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.NewWalkStateEvent, ExternalEvents.ActorSetWalkEvent, (ev) =>
			this.getSpawnedActorConnIds(ev.actorId),
		);

		this.redirectToBusEvent(this.actorManager, Events.NewPosEvent, ExternalEvents.ActorNewPosEvent, (ev) =>
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
