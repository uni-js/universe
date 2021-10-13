import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { Controller } from '../shared/controller';
import { LandManager } from '../manager/land-manager';
import { inject, injectable } from 'inversify';
import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { ExternalEvent } from '../../event/spec';

@injectable()
export class ActorController implements Controller {
	constructor(
		@inject(EventBusSymbol) private eventBus: EventBus,

		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		this.eventBus.on(ClientEvents.ActorToggleUsingEvent.name, this.handleActorToggleUsingEvent.bind(this));

		this.actorManager.onEvent(Events.NewPosEvent, this.onNewPosEvent.bind(this));
		this.actorManager.onEvent(Events.AddEntityEvent, this.onActorAdded.bind(this));
		this.actorManager.onEvent(Events.RemoveEntityEvent, this.onActorRemoved.bind(this));
		this.actorManager.onEvent(Events.NewWalkStateEvent, this.onWalkStateSet.bind(this));

		this.actorManager.onEvent(Events.ActorSetAttachment, this.onActorSetAttachment.bind(this));
		this.actorManager.onEvent(Events.ActorRemoveAttachment, this.onActorRemoveAttachment.bind(this));

		this.actorManager.onEvent(Events.ActorToggleUsingEvent, this.onActorToggleUsing.bind(this));
		this.actorManager.onEvent(Events.ActorDamagedEvent, this.onActorDamaged.bind(this));
	}
	private onActorDamaged(event: Events.ActorDamagedEvent) {
		const exEvent = new ExternalEvents.ActorDamagedEvent();
		exEvent.actorId = event.actorId;
		exEvent.finalHealth = event.finalHealth;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	private onActorToggleUsing(event: Events.ActorToggleUsingEvent) {
		const exEvent = new ExternalEvents.ActorToggleUsing();
		exEvent.actorId = event.actorId;
		exEvent.startOrEnd = event.startOrEnd;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	private handleActorToggleUsingEvent(connId: string, event: ClientEvents.ActorToggleUsingEvent) {
		if (event.startOrEnd) {
			this.actorManager.startUsing(event.actorId);
		} else {
			this.actorManager.endUsing(event.actorId);
		}
	}

	private onActorSetAttachment(event: Events.ActorSetAttachment) {
		const exEvent = new ExternalEvents.ActorSetAttachment();
		exEvent.actorId = event.actorId;
		exEvent.key = event.key;
		exEvent.targetActorId = event.targetActorId;

		this.emitToActorSpawned(event.targetActorId, exEvent);
	}

	private onActorRemoveAttachment(event: Events.ActorRemoveAttachment) {
		const exEvent = new ExternalEvents.ActorRemoveAttachment();
		exEvent.targetActorId = event.actorId;
		exEvent.key = event.key;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	private onActorAdded(event: Events.AddEntityEvent) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.spawnActor(player, event.entityId);
		}
	}
	private onActorRemoved(event: Events.RemoveEntityEvent) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.despawnActor(player, event.entityId);
		}
	}
	private onWalkStateSet(event: Events.NewWalkStateEvent) {
		const actor = this.actorManager.getEntityById(event.actorId);

		const exEvent = new ExternalEvents.ActorSetWalkEvent();

		exEvent.actorId = event.actorId;
		exEvent.direction = actor.direction;
		exEvent.running = actor.running;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	private onNewPosEvent(event: Events.NewPosEvent) {
		const exEvent = new ExternalEvents.ActorNewPosEvent();
		exEvent.actorId = event.actorId;
		exEvent.isControlMoved = event.isControlMoved;
		exEvent.posX = event.posX;
		exEvent.posY = event.posY;

		this.emitToActorSpawned(event.actorId, exEvent);
	}

	private emitToActorSpawned(actorId: number, event: ExternalEvent) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => this.playerManager.hasAtRecord(player, 'spawnedActors', actorId))
			.map((player) => player.connId);

		this.eventBus.emitTo(sids, event);
	}
	doTick(tick: number) {}
}
