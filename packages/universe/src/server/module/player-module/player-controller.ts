import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { Logger } from '@uni.js/utils';

import { PlayerManager } from '../player-module/player-manager';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../../module/actor-module/actor-manager';
import { HandleExternalEvent } from '@uni.js/event';

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
		Logger.info(`user logined :`, player.playerName, player.connId);
	}

	@HandleExternalEvent(ClientEvents.ControlMovedEvent)
	private handleMovePlayer(connId: string, event: ClientEvents.ControlMovedEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.processInput(player.$loki, event.input);
	}

	@HandleExternalEvent(ClientEvents.SetAimTargetEvent)
	private handleSetAimTargetEvent(connId: string, event: ClientEvents.SetAimTargetEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.setAimTarget(player.$loki, event.rotation);
	}
}
