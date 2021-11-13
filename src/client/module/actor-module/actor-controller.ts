import { EventBusClient } from '../../../framework/client-side/bus-client';
import { Vector2 } from '../../../server/shared/math';
import { ActorManager } from './actor-manager';
import { Player } from '../player-module/player-object';
import { TextureProvider } from '../../../framework/client-side/texture';
import { inject, injectable } from 'inversify';
import { PlayerManager } from '../player-module/player-manager';
import { ActorFactory, ActorObject } from './actor-object';
import { ClientSideController } from '../../../framework/client-side/client-controller';

import * as ServerEvents from '../../../server/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { HandleExternalEvent } from '../../../framework/event';

@injectable()
export class ActorController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(TextureProvider) private texture: TextureProvider,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.actorManager, Events.ActorToggleUsingEvent, ExternalEvents.ActorToggleUsingEvent);
		this.redirectToBusEvent(this.actorManager, Events.ActorToggleWalkEvent, ExternalEvents.ActorToggleWalkEvent);
		this.redirectToBusEvent(this.playerManager, Events.RotateAttachmentEvent, ExternalEvents.RotateAttachmentEvent);
	}

	@HandleExternalEvent(ServerEvents.ActorToggleUsingEvent)
	private handleActorToggleUsing(event: ServerEvents.ActorToggleUsingEvent) {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (event.startOrEnd) {
			actor.startUsing(false);
		} else {
			actor.endUsing(false);
		}
	}

	@HandleExternalEvent(ServerEvents.ActorSetAttachmentEvent)
	private handleSetAttachment(event: ServerEvents.ActorSetAttachmentEvent) {
		const targetActor = this.actorManager.getObjectById(event.targetActorId);
		const actor = this.actorManager.getObjectById(event.actorId);

		targetActor.setAttachment(event.key, event.actorId);
		actor.attaching = { key: event.key, actorId: event.targetActorId };
	}

	@HandleExternalEvent(ServerEvents.ActorRemoveAttachmentEvent)
	private handleRemoveAttachment(event: ServerEvents.ActorRemoveAttachmentEvent) {
		const actor = this.actorManager.getObjectById(event.targetActorId);
		actor.removeAttachment(event.key);
	}

	@HandleExternalEvent(ServerEvents.SpawnActorEvent)
	private handleActorAdded(event: ServerEvents.SpawnActorEvent) {
		const newActor = this.actorFactory.getNewObject(event.actorType, [event.actorId, event.ctorOption, this.texture]);
		this.actorManager.addGameObject(newActor);

		console.debug('Spawned', event.actorType, event.ctorOption, newActor);
	}

	@HandleExternalEvent(ServerEvents.DespawnActorEvent)
	private handleActorRemoved(event: ServerEvents.DespawnActorEvent) {
		const object = this.actorManager.getObjectById(event.actorId);
		console.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorManager.removeGameObject(object);
	}

	@HandleExternalEvent(ServerEvents.NewWalkStateEvent)
	private handleActorNewWalkState(event: ServerEvents.NewWalkStateEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;

		object.direction = event.direction;
		object.running = event.running;
	}

	@HandleExternalEvent(ServerEvents.NewPosEvent)
	private handleActorNewPos(event: ServerEvents.NewPosEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerManager.isCurrentPlayer(object as Player);
		const pos = new Vector2(event.posX, event.posY);

		if (isCurrentPlayer) {
			const player = object as Player;
			player.ackInput({
				x: event.posX,
				y: event.posY,
				lastProcessedInput: event.processedInputSeq,
			});
		} else {
			object.addMovePoint(pos);
		}
	}

	@HandleExternalEvent(ServerEvents.ActorDamagedEvent)
	private handleActorDamaged(event: ServerEvents.ActorDamagedEvent) {
		this.actorManager.damageActor(event.actorId, event.finalHealth);
	}

	@HandleExternalEvent(ServerEvents.ActorSetRotationEvent)
	private handleSetRotation(event: ServerEvents.ActorSetRotationEvent) {
		this.actorManager.setRotation(event.actorId, event.rotation);
	}
}
