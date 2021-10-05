import { EventBusClient } from '../../event/bus-client';
import {
	ActorNewPosEvent,
	ActorRemoveAttachment,
	ActorSetAttachment,
	ActorSetWalkEvent,
	ActorToggleUsing,
	AddActorEvent,
	RemoveActorEvent,
} from '../../event/server-side';
import { Vector2 } from '../../server/shared/math';
import { ActorManager } from '../manager/actor-manager';
import { Player } from '../object/player';
import { TextureProvider } from '../texture';
import { inject, injectable } from 'inversify';
import { PlayerManager } from '../manager/player-manager';
import { ActorFactory, ActorObject } from '../shared/actor';
import { GameEvent } from '../event';
import { ActorToggleUsingEvent, ActorToggleWalkEvent } from '../../event/client-side';

@injectable()
export class ActorService {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(TextureProvider) private texture: TextureProvider,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		this.eventBus.on(AddActorEvent.name, this.handleActorAdded.bind(this));
		this.eventBus.on(RemoveActorEvent.name, this.handleActorRemoved.bind(this));
		this.eventBus.on(ActorNewPosEvent.name, this.handleActorNewPos.bind(this));
		this.eventBus.on(ActorSetWalkEvent.name, this.handleActorNewWalkState.bind(this));

		this.eventBus.on(ActorSetAttachment.name, this.handleSetAttachment.bind(this));
		this.eventBus.on(ActorRemoveAttachment.name, this.handleRemoveAttachment.bind(this));

		this.eventBus.on(ActorToggleUsing.name, this.handleActorToggleUsing.bind(this));

		this.actorManager.on(GameEvent.ActorToggleUsingEvent, this.onActorToggleUsing.bind(this));
		this.actorManager.on(GameEvent.ActorToggleWalkEvent, this.onActorToggleWalk.bind(this));
	}

	private onActorToggleWalk(actor: ActorObject) {
		this.eventBus.emitEvent(new ActorToggleWalkEvent(actor.getRunning(), actor.getDirection()));
	}

	private onActorToggleUsing(actorId: number, startOrEnd: boolean) {
		this.eventBus.emitEvent(new ActorToggleUsingEvent(actorId, startOrEnd));
	}

	private handleActorToggleUsing(event: ActorToggleUsing) {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (event.startOrEnd) {
			actor.startUsing(false);
		} else {
			actor.endUsing(false);
		}
	}

	private handleSetAttachment(event: ActorSetAttachment) {
		const targetActor = this.actorManager.getObjectById(event.targetActorId);
		const actor = this.actorManager.getObjectById(event.actorId);

		targetActor.setAttachment(event.key, event.actorId);
		actor.setAttaching(event.key, event.targetActorId);
	}

	private handleRemoveAttachment(event: ActorRemoveAttachment) {
		const actor = this.actorManager.getObjectById(event.targetActorId);
		actor.removeAttachment(event.key);
	}

	private handleActorAdded(event: AddActorEvent) {
		const newActor = this.actorFactory.getNewObject(event.type, [event.serverId, event.ctorOption, this.texture]);
		this.actorManager.addGameObject(newActor);

		console.debug('Spawned', event.type, event.ctorOption, newActor);
	}
	private handleActorRemoved(event: RemoveActorEvent) {
		const object = this.actorManager.getObjectById(event.actorId);
		console.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorManager.removeGameObject(object);
	}
	private handleActorNewWalkState(event: ActorSetWalkEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;

		object.setDirection(event.direction, false);
		object.setRunning(event.running, false);
	}
	private handleActorNewPos(event: ActorNewPosEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerManager.isCurrentPlayer(object as Player);
		const pos = new Vector2(event.x, event.y);

		if (isCurrentPlayer) {
			if (pos.distanceTo(object.getPosition()) >= 0.2) {
				object.addMovePoint(pos);
			}
		} else {
			object.addMovePoint(pos);
		}
	}
}
