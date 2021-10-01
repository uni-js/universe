import { EventBusClient } from '../../event/bus-client';
import { ActorNewPosEvent, ActorSetWalkEvent, AddActorEvent, RemoveActorEvent } from '../../event/server-side';
import { ActorType } from '../../server/shared/entity';
import { Vector2 } from '../../server/shared/math';
import { ActorObject } from '../shared/game-object';
import { ActorManager } from '../manager/actor-manager';
import { Player } from '../object/player';
import { TextureContainer } from '../texture';
import { inject, injectable } from 'inversify';
import { PlayerManager } from '../manager/player-manager';

@injectable()
export class ActorService {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(TextureContainer) private texture: TextureContainer,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		this.eventBus.on(AddActorEvent.name, this.handleActorAdded.bind(this));
		this.eventBus.on(RemoveActorEvent.name, this.handleActorRemoved.bind(this));
		this.eventBus.on(ActorNewPosEvent.name, this.handleActorNewPos.bind(this));
		this.eventBus.on(ActorSetWalkEvent.name, this.handleActorNewWalkState.bind(this));
	}
	private handleActorAdded(event: AddActorEvent) {
		console.debug('Spawned', event.actorId, event);
		const pos = new Vector2(event.x, event.y);
		if (event.type == ActorType.PLAYER) {
			const player = new Player(this.texture, event.actorId, pos, event.playerName);
			this.actorManager.addGameObject(player);
		} else {
			const actor = new ActorObject(event.type, this.texture, event.actorId, new Vector2(1, 1), pos, '');
			this.actorManager.addGameObject(actor);
		}
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
