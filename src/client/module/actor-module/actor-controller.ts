import { EventBusClient } from '@uni.js/client';
import { Vector2 } from '../../../server/shared/math';
import { ActorManager } from './actor-manager';
import { Player } from '../player-module/player-object';
import { TextureProvider } from '@uni.js/texture';
import { inject, injectable } from 'inversify';
import { PlayerManager } from '../player-module/player-manager';
import { ActorFactory, ActorObject } from './actor-object';
import { ClientSideController } from '@uni.js/client';

import * as ServerEvents from '../../../server/event';

import * as ExternalEvents from '../../event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { Logger } from '@uni.js/utils';

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
	}

	@EmitLocalEvent('actorManager', 'ActorToggleUsingEvent')
	@EmitLocalEvent('actorManager', 'ActorToggleWalkEvent')
	@EmitLocalEvent('playerManager', 'SetAimTargetEvent')
	private emitLocalEvent() {}

	@HandleRemoteEvent(ServerEvents.ActorToggleUsingEvent)
	private handleActorToggleUsing(event: ServerEvents.ActorToggleUsingEvent) {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (event.startOrEnd) {
			actor.startUsing(false);
		} else {
			actor.endUsing(false);
		}
	}

	@HandleRemoteEvent(ServerEvents.ActorSetAttachmentEvent)
	private handleSetAttachment(event: ServerEvents.ActorSetAttachmentEvent) {
		const targetActor = this.actorManager.getObjectById(event.actorId);
		const actor = this.actorManager.getObjectById(event.attachActorId);

		targetActor.setAttachment(event.key, event.attachActorId);
		actor.attaching = { key: event.key, actorId: event.actorId };
	}

	@HandleRemoteEvent(ServerEvents.ActorRemoveAttachmentEvent)
	private handleRemoveAttachment(event: ServerEvents.ActorRemoveAttachmentEvent) {
		const actor = this.actorManager.getObjectById(event.actorId);
		actor.removeAttachment(event.key);
	}

	@HandleRemoteEvent(ServerEvents.SpawnActorEvent)
	private handleActorAdded(event: ServerEvents.SpawnActorEvent) {
		const newActor = this.actorFactory.getNewObject(event.actorType, [event.actorId, event.ctorOption, this.texture]);
		this.actorManager.addGameObject(newActor);

		Logger.debug('Spawned', event.actorType, event.ctorOption, newActor);
	}

	@HandleRemoteEvent(ServerEvents.DespawnActorEvent)
	private handleActorRemoved(event: ServerEvents.DespawnActorEvent) {
		const object = this.actorManager.getObjectById(event.actorId);
		Logger.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorManager.removeGameObject(object);
	}

	@HandleRemoteEvent(ServerEvents.NewWalkStateEvent)
	private handleActorNewWalkState(event: ServerEvents.NewWalkStateEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;

		object.direction = event.direction;
		object.running = event.running;
	}

	@HandleRemoteEvent(ServerEvents.NewPosEvent)
	private handleActorNewPos(event: ServerEvents.NewPosEvent) {
		const object = this.actorManager.getObjectById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerManager.isCurrentPlayer(object as Player);
		const pos = new Vector2(event.posX, event.posY);

		if (isCurrentPlayer) {
			const player = object as Player;
			player.ackInput({
				x: event.posX,
				y: event.posY,
				motionX: event.motionX,
				motionY: event.motionY,
				lastProcessedInput: event.processedInputSeq,
			});
		} else {
			object.addMovePoint(pos);
		}
	}

	@HandleRemoteEvent(ServerEvents.ActorDamagedEvent)
	private handleActorDamaged(event: ServerEvents.ActorDamagedEvent) {
		this.actorManager.damageActor(event.actorId, event.finalHealth);
	}

	@HandleRemoteEvent(ServerEvents.ActorSetRotationEvent)
	private handleSetRotation(event: ServerEvents.ActorSetRotationEvent) {
		this.actorManager.setRotation(event.actorId, event.rotation);
	}
}
