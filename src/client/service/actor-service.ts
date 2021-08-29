import { EventBusClient } from '../../event/bus-client';
import { ActorNewPosEvent, ActorSetStateEvent, AddActorEvent, RemoveActorEvent } from '../../event/server-side';
import { ActorType } from '../../server/shared/entity';
import { Vector2 } from '../../server/shared/math';
import { ActorObject, GameObjectEvent, IGameObject } from '../shared/game-object';
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
		this.eventBus.on(ActorSetStateEvent.name, this.handleActorNewBaseState.bind(this));
	}
	private handleActorAdded(event: AddActorEvent) {
		console.debug('Spawned', event.actorId, event);
		const pos = new Vector2(event.x, event.y);
		if (event.type == ActorType.PLAYER) {
			const player = new Player(this.texture, event.actorId, pos, event.playerName);
			this.actorManager.addActor(player);
		} else {
			const actor = new ActorObject(event.type, this.texture, event.actorId, new Vector2(1, 1), pos, '');
			this.actorManager.addActor(actor);
		}
	}
	private handleActorRemoved(event: RemoveActorEvent) {
		const object = this.actorManager.getActorById(event.actorId);
		console.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorManager.removeActor(object);
	}
	private handleActorNewBaseState(event: ActorSetStateEvent) {
		const object = this.actorManager.getActorById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerManager.isCurrentPlayer(object as Player);

		object.setDirection(event.direction);
		object.setWalking(event.walking);
	}
	private handleActorNewPos(event: ActorNewPosEvent) {
		const object = this.actorManager.getActorById(event.actorId) as ActorObject;
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
