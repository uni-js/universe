import { EventBusClient } from '../../event/bus-client';
import { Vector2 } from '../../server/shared/math';
import { ActorManager } from '../manager/actor-manager';
import { Player } from '../object/player';
import { TextureProvider } from '../texture';
import { inject, injectable } from 'inversify';
import { PlayerManager } from '../manager/player-manager';
import { ActorFactory, ActorObject } from '../shared/actor';
import { GameController } from '../system/controller';

import * as ServerEvents from '../../server/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class ActorController extends GameController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(TextureProvider) private texture: TextureProvider,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		super(eventBus);

		this.eventBus.on(ServerEvents.AddActorEvent.name, this.handleActorAdded.bind(this));
		this.eventBus.on(ServerEvents.RemoveActorEvent.name, this.handleActorRemoved.bind(this));
		this.eventBus.on(ServerEvents.ActorNewPosEvent.name, this.handleActorNewPos.bind(this));
		this.eventBus.on(ServerEvents.ActorSetWalkEvent.name, this.handleActorNewWalkState.bind(this));

		this.eventBus.on(ServerEvents.ActorSetAttachment.name, this.handleSetAttachment.bind(this));
		this.eventBus.on(ServerEvents.ActorRemoveAttachment.name, this.handleRemoveAttachment.bind(this));

		this.eventBus.on(ServerEvents.ActorToggleUsing.name, this.handleActorToggleUsing.bind(this));

		this.eventBus.on(ServerEvents.ActorDamagedEvent.name, this.handleActorDamaged.bind(this));

		this.redirectToRemoteEvent(this.actorManager, Events.ActorToggleUsingEvent, ExternalEvents.ActorToggleUsingEvent);

		this.actorManager.onEvent(Events.ActorToggleWalkEvent, this.onActorToggleWalk.bind(this));
	}

	private onActorToggleWalk(event: Events.ActorToggleWalkEvent) {
		const player = this.playerManager.getCurrentPlayer();
		if (!player || player.getServerId() !== event.actorId) return;

		const exEvent = new ExternalEvents.ActorToggleWalkEvent();
		exEvent.actorId = event.actorId;
		exEvent.direction = event.direction;
		exEvent.running = event.running;
		exEvent.isExternal = true;

		this.eventBus.emitEvent(exEvent);
	}

	private handleActorToggleUsing(event: ServerEvents.ActorToggleUsing) {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (event.startOrEnd) {
			actor.startUsing(false);
		} else {
			actor.endUsing(false);
		}
	}

	private handleSetAttachment(event: ServerEvents.ActorSetAttachment) {
		const targetActor = this.actorManager.getObjectById(event.targetActorId);
		const actor = this.actorManager.getObjectById(event.actorId);

		targetActor.setAttachment(event.key, event.actorId);
		actor.setAttaching(event.key, event.targetActorId);
	}

	private handleRemoveAttachment(event: ServerEvents.ActorRemoveAttachment) {
		const actor = this.actorManager.getObjectById(event.targetActorId);
		actor.removeAttachment(event.key);
	}

	private handleActorAdded(event: ServerEvents.AddActorEvent) {
		const newActor = this.actorFactory.getNewObject(event.type, [event.serverId, event.ctorOption, this.texture]);
		this.actorManager.addGameObject(newActor);

		console.debug('Spawned', event.type, event.ctorOption, newActor);
	}
	private handleActorRemoved(event: ServerEvents.RemoveActorEvent) {
		const object = this.actorManager.getObjectById(event.actorId);
		console.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorManager.removeGameObject(object);
	}
	private handleActorNewWalkState(event: ServerEvents.ActorSetWalkEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;

		object.setDirection(event.direction, false);
		object.setRunning(event.running, false);
	}
	private handleActorNewPos(event: ServerEvents.ActorNewPosEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerManager.isCurrentPlayer(object as Player);
		const pos = new Vector2(event.posX, event.posY);

		if (isCurrentPlayer) {
			if (!event.isControlMoved) {
				object.addMovePoint(pos);
			}
		} else {
			object.addMovePoint(pos);
		}
	}

	private handleActorDamaged(event: ServerEvents.ActorDamagedEvent) {
		this.actorManager.damageActor(event.actorId, event.finalHealth);
	}
}
