import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { PlayerManager } from '../manager/player-manager';
import { Vector2 } from '../shared/math';
import { ServerController } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../manager/actor-manager';

import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { HandleExternalEvent } from '../../event/spec';
import { AttachType } from '../actor/spec';

@injectable()
export class PlayerController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.playerManager,
			Events.SpawnActorEvent,
			ExternalEvents.AddActorEvent,
			(ev) => this.playerManager.getEntityById(ev.fromPlayerId).connId,
		);
		this.redirectToBusEvent(
			this.playerManager,
			Events.DespawnActorEvent,
			ExternalEvents.RemoveActorEvent,
			(ev) => this.playerManager.getEntityById(ev.fromPlayerId).connId,
		);
	}

	@HandleExternalEvent(ClientEvents.ActorToggleWalkEvent)
	private handleActorToggleWalk(connId: string, event: ClientEvents.ActorToggleWalkEvent) {
		const player = this.playerManager.findEntity({ connId });
		if (event.actorId !== player.$loki) return;

		this.actorManager.setWalkState(player.$loki, event.running, event.direction);
	}

	@HandleExternalEvent(ClientEvents.LoginEvent)
	private handleLogin(connId: string) {
		const player = this.playerManager.addNewPlayer(connId);
		const event = new ExternalEvents.LoginedEvent();
		event.actorId = player.$loki;

		this.eventBus.emitTo([connId], event);
		console.log(`user logined :`, player.connId);
	}

	@HandleExternalEvent(ClientEvents.ControlMovedEvent)
	private handleMovePlayer(connId: string, event: ClientEvents.ControlMovedEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.moveToPosition(player, new Vector2(event.posX, event.posY), true);
	}

	@HandleExternalEvent(ClientEvents.RotateAttachmentEvent)
	private handleRotateAttachment(connId: string, event: ClientEvents.RotateAttachmentEvent) {
		const player = this.playerManager.findEntity({ connId });
		const attachment = this.actorManager.getAttachment(player.$loki, AttachType.RIGHT_HAND);
		this.actorManager.setRotation(attachment.actorId, event.rotation);
	}
}
