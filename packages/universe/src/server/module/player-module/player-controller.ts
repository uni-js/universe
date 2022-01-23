import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { Logger } from '@uni.js/utils';

import { PlayerManager } from '../player-module/player-manager';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../../module/actor-module/actor-manager';
import { HandleEvent, HandleRemoteEvent } from '@uni.js/event';

import * as ClientEvents from '../../../client/event';

import * as ExternalEvents from '../../event';

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
			"SpawnActorEvent",
			ExternalEvents.SpawnActorEvent,
			(ev) => this.playerManager.getEntityById(ev.fromPlayerId).connId,
		);
		this.redirectToBusEvent(
			this.playerManager,
			"DespawnActorEvent",
			ExternalEvents.DespawnActorEvent,
			(ev) => this.playerManager.getEntityById(ev.fromPlayerId).connId,
		);
	}

	@HandleRemoteEvent(ClientEvents.ActorToggleWalkEvent)
	private handleActorToggleWalk(connId: string, event: ClientEvents.ActorToggleWalkEvent) {
		const player = this.playerManager.findEntity({ connId });
		if (event.actorId !== player.id) return;

		this.actorManager.setWalkState(player.id, event.running, event.direction);
	}

	@HandleRemoteEvent(ClientEvents.LoginEvent)
	private handleLogin(connId: string) {
		const player = this.playerManager.addNewPlayer(connId);
		const event = new ExternalEvents.LoginedEvent();
		event.actorId = player.id;

		this.eventBus.emitTo([connId], event);
		Logger.info(`user logined :`, player.playerName, player.connId);
	}

	@HandleRemoteEvent(ClientEvents.ControlMovedEvent)
	private handleMovePlayer(connId: string, event: ClientEvents.ControlMovedEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.processInput(player.id, event.input);
	}

	@HandleRemoteEvent(ClientEvents.SetAimTargetEvent)
	private handleSetAimTargetEvent(connId: string, event: ClientEvents.SetAimTargetEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.setAimTarget(player.id, event.rotation);
	}
}
