import { EventBusServer, EventBusServerSymbol } from '../../../framework/server-side/bus-server';
import { PlayerManager } from '../player-module/player-manager';
import { Vector2 } from '../../shared/math';
import { ServerSideController } from '../../../framework/server-side/server-controller';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../../module/actor-module/actor-manager';
import { HandleExternalEvent } from '../../../framework/event';

import * as ClientEvents from '../../../client/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

@injectable()
export class PlayerController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.playerManager,
			Events.SpawnActorEvent,
			ExternalEvents.SpawnActorEvent,
			(ev) => this.playerManager.getEntityById(ev.fromPlayerId).connId,
		);
		this.redirectToBusEvent(
			this.playerManager,
			Events.DespawnActorEvent,
			ExternalEvents.DespawnActorEvent,
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
		this.actorManager.processInput(player.$loki, event.input);
	}

	@HandleExternalEvent(ClientEvents.RotateAttachmentEvent)
	private handleRotateAttachment(connId: string, event: ClientEvents.RotateAttachmentEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.rotateAttachment(player.$loki, event.rotation);
	}
}
