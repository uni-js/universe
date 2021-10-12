import {
	ActorDamagedEvent,
	ActorNewPosEvent,
	ActorRemoveAttachment,
	ActorSetAttachment,
	ActorSetWalkEvent,
	ActorToggleUsing,
} from '../../event/server-side';
import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { Controller } from '../shared/controller';
import { LandManager } from '../manager/land-manager';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import * as ClientEvents from '../../client/event/external';

@injectable()
export class ActorController implements Controller {
	constructor(
		@inject(EventBusSymbol) private eventBus: EventBus,

		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		this.eventBus.on(ClientEvents.ActorToggleUsingEvent.name, this.handleActorToggleUsingEvent.bind(this));

		this.actorManager.on(GameEvent.NewPosEvent, this.onNewPosEvent.bind(this));
		this.actorManager.on(GameEvent.AddEntityEvent, this.onActorAdded.bind(this));
		this.actorManager.on(GameEvent.RemoveEntityEvent, this.onActorRemoved.bind(this));
		this.actorManager.on(GameEvent.NewWalkStateEvent, this.onWalkStateSet.bind(this));

		this.actorManager.on(GameEvent.ActorSetAttachment, this.onActorSetAttachment.bind(this));
		this.actorManager.on(GameEvent.ActorRemoveAttachment, this.onActorRemoveAttachment.bind(this));

		this.actorManager.on(GameEvent.ActorToggleUsingEvent, this.onActorToggleUsing.bind(this));
		this.actorManager.on(GameEvent.ActorDamagedEvent, this.onActorDamaged.bind(this));
	}
	private onActorDamaged(actorId: number, finalHealth: number) {
		const event = new ActorDamagedEvent(actorId, finalHealth);
		this.emitToActorSpawned(actorId, event);
	}

	private onActorToggleUsing(actorId: number, startOrEnd: boolean) {
		const event = new ActorToggleUsing(actorId, startOrEnd);
		this.emitToActorSpawned(actorId, event);
	}

	private handleActorToggleUsingEvent(connId: string, event: ClientEvents.ActorToggleUsingEvent) {
		if (event.startOrEnd) {
			this.actorManager.startUsing(event.actorId);
		} else {
			this.actorManager.endUsing(event.actorId);
		}
	}

	private onActorSetAttachment(targetActorId: number, key: string, actorId: number) {
		this.emitToActorSpawned(targetActorId, new ActorSetAttachment(targetActorId, key, actorId));
	}

	private onActorRemoveAttachment(targetActorId: number, key: string) {
		this.emitToActorSpawned(targetActorId, new ActorRemoveAttachment(targetActorId, key));
	}

	private onActorAdded(actorId: number) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.spawnActor(player, actorId);
		}
	}
	private onActorRemoved(actorId: number) {
		for (const player of this.playerManager.getAllEntities()) {
			this.playerManager.despawnActor(player, actorId);
		}
	}
	private onWalkStateSet(actorId: number) {
		const actor = this.actorManager.getEntityById(actorId);

		const event = new ActorSetWalkEvent(actorId, actor.direction, actor.running);
		this.emitToActorSpawned(actorId, event);
	}
	private onNewPosEvent(actorId: number, controlMove: boolean) {
		const actor = this.actorManager.getEntityById(actorId);

		const event = new ActorNewPosEvent(actorId, actor.posX, actor.posY, controlMove);

		this.emitToActorSpawned(actorId, event);
	}
	private emitToActorSpawned(actorId: number, event: any) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => this.playerManager.hasAtRecord(player, 'spawnedActors', actorId))
			.map((player) => player.connId);

		this.eventBus.emitTo(sids, event);
	}
	doTick(tick: number) {}
}
