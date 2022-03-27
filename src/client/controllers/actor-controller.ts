import { EventBusClient } from '@uni.js/client';
import { Vector2 } from '../../server/utils/math';
import { ActorMgr } from '../managers/actor-mgr';
import { Player } from '../objects/player-object';
import { TextureProvider } from '@uni.js/texture';
import { inject, injectable } from 'inversify';
import { PlayerMgr } from '../managers/player-mgr';
import { ActorObject } from '../objects/actor-object';
import { ClientSideController } from '@uni.js/client';

import * as ServerEvents from '../../server/event';

import * as ExternalEvents from '../event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { Logger } from '@uni.js/utils';
import { ActorFactory } from '../factory/actor';

@injectable()
export class ActorController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ActorMgr) private actorMgr: ActorMgr,
		@inject(TextureProvider) private texture: TextureProvider,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(ActorFactory) private actorFactory: ActorFactory,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('actorMgr', 'ActorToggleWalkEvent')
	@EmitLocalEvent('playerMgr', 'SetAimTargetEvent')
	private emitLocalEvent() {}

	@HandleRemoteEvent(ServerEvents.ActorSetRightHandEvent)
	private handleSetAttachment(event: ServerEvents.ActorSetRightHandEvent) {
		const targetActor = this.actorMgr.getObjectById(event.actorId);
		const actor = this.actorMgr.getObjectById(event.attachActorId);

		targetActor.setRightHand(event.attachActorId);
		actor.attaching = event.actorId;
		this.playerMgr.settingAimTarget = true;
	}

	@HandleRemoteEvent(ServerEvents.ActorRemoveRightHandEvent)
	private handleRemoveAttachment(event: ServerEvents.ActorRemoveRightHandEvent) {
		const actor = this.actorMgr.getObjectById(event.actorId);
		actor.setRightHand(undefined);
		this.playerMgr.settingAimTarget = false;
	}

	@HandleRemoteEvent(ServerEvents.SpawnActorEvent)
	private handleActorAdded(event: ServerEvents.SpawnActorEvent) {
		const option = event.ctorOption;
		const newActor = this.actorFactory.getNewObject(event.actorType, [event.actorId, option, this.texture]);
		this.actorMgr.addGameObject(newActor);

		Logger.debug('Spawned', event.actorType, event.ctorOption, newActor);
	}

	@HandleRemoteEvent(ServerEvents.DespawnActorEvent)
	private handleActorRemoved(event: ServerEvents.DespawnActorEvent) {
		const object = this.actorMgr.getObjectById(event.actorId);
		Logger.debug('Despawned', event.actorId, event, object);

		if (!object) return;

		this.actorMgr.removeGameObject(object);
	}

	@HandleRemoteEvent(ServerEvents.NewWalkStateEvent)
	private handleActorNewWalkState(event: ServerEvents.NewWalkStateEvent) {
		const object = this.actorMgr.getObjectById(event.actorId) as ActorObject;

		object.direction = event.direction;
		object.running = event.running;
	}

	@HandleRemoteEvent(ServerEvents.NewPosEvent)
	private handleActorNewPos(event: ServerEvents.NewPosEvent) {
		const object = this.actorMgr.getObjectById(event.actorId) as ActorObject;
		const isCurrentPlayer = this.playerMgr.isCurrPlayer(object as Player);
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
		this.actorMgr.damageActor(event.actorId, event.finalHealth);
	}

	@HandleRemoteEvent(ServerEvents.ActorSetRotationEvent)
	private handleSetRotation(event: ServerEvents.ActorSetRotationEvent) {
		this.actorMgr.setRotation(event.actorId, event.rotation);
	}
}
