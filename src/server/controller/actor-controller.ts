import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { LandManager } from '../manager/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { ExternalEvent, HandleExternalEvent, HandleInternalEvent } from '../../event/spec';
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
	}

	@HandleInternalEvent('actorManager', Events.ActorDamagedEvent)
	private onActorDamaged(event: Events.ActorDamagedEvent) {
		const exEvent = new ExternalEvents.ActorDamagedEvent();
		exEvent.actorId = event.actorId;
		exEvent.finalHealth = event.finalHealth;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	@HandleInternalEvent('actorManager', Events.ActorToggleUsingEvent)
	private onActorToggleUsing(event: Events.ActorToggleUsingEvent) {
		const exEvent = new ExternalEvents.ActorToggleUsing();
		exEvent.actorId = event.actorId;
		exEvent.startOrEnd = event.startOrEnd;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	@HandleInternalEvent('actorManager', Events.ActorSetAttachment)
	private onActorSetAttachment(event: Events.ActorSetAttachment) {
		const exEvent = new ExternalEvents.ActorSetAttachment();
		exEvent.actorId = event.actorId;
		exEvent.key = event.key;
		exEvent.targetActorId = event.targetActorId;

		this.emitToActorSpawned(event.targetActorId, exEvent);
	}

	@HandleInternalEvent('actorManager', Events.ActorRemoveAttachment)
	private onActorRemoveAttachment(event: Events.ActorRemoveAttachment) {
		const exEvent = new ExternalEvents.ActorRemoveAttachment();
		exEvent.targetActorId = event.actorId;
		exEvent.key = event.key;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	@HandleInternalEvent('actorManager', Events.AddEntityEvent)
	private onActorAdded(event: Events.AddEntityEvent) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.spawnActor(player, event.entityId);
		}
	}

	@HandleInternalEvent('actorManager', Events.RemoveEntityEvent)
	private onActorRemoved(event: Events.RemoveEntityEvent) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.despawnActor(player, event.entityId);
		}
	}

	@HandleInternalEvent('actorManager', Events.NewWalkStateEvent)
	private onWalkStateSet(event: Events.NewWalkStateEvent) {
		const actor = this.actorManager.getEntityById(event.actorId);

		const exEvent = new ExternalEvents.ActorSetWalkEvent();

		exEvent.actorId = event.actorId;
		exEvent.direction = actor.direction;
		exEvent.running = actor.running;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	@HandleInternalEvent('actorManager', Events.NewPosEvent)
	private onNewPosEvent(event: Events.NewPosEvent) {
		const exEvent = new ExternalEvents.ActorNewPosEvent();
		exEvent.actorId = event.actorId;
		exEvent.isControlMoved = event.isControlMoved;
		exEvent.posX = event.posX;
		exEvent.posY = event.posY;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	@HandleExternalEvent(ClientEvents.ActorToggleUsingEvent)
	private handleActorToggleUsingEvent(connId: string, event: ClientEvents.ActorToggleUsingEvent) {
		if (event.startOrEnd) {
			this.actorManager.startUsing(event.actorId);
		} else {
			this.actorManager.endUsing(event.actorId);
		}
	}

	private emitToActorSpawned(actorId: number, event: ExternalEvent) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => this.playerManager.hasAtRecord(player, 'spawnedActors', actorId))
			.map((player) => player.connId);

		this.eventBus.emitTo(sids, event);
	}
}
