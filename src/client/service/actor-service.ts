import { EventBusClient } from '../../event/bus-client';
import {
	ActorNewPosEvent,
	ActorRemoveAttachment,
	ActorSetAttachment,
	ActorSetWalkEvent,
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
	}
	private handleSetAttachment(event: ActorSetAttachment) {
		const actor = this.actorManager.getObjectById(event.targetActorId);
		actor.setAttachment(event.key, event.actorId);
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

		object.setDirection(event.direction);
		object.setRunning(event.running);
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
