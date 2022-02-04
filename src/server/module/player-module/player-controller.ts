import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { Logger } from '@uni.js/utils';

import { PlayerManager } from '../player-module/player-manager';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../../module/actor-module/actor-manager';
import { EmitLocalEvent, HandleEvent, HandleRemoteEvent } from '@uni.js/event';

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
	}

	@EmitLocalEvent('playerManager', 'SpawnActorEvent')
	@EmitLocalEvent('playerManager', 'DespawnActorEvent')
	private emitToPlayer(ev: any) {
		return this.playerManager.getEntityById(ev.fromPlayerId).connId;
	}

	@EmitLocalEvent('playerManager', 'ToggleUsingEvent')
	private emitToPlayerNearActors(ev: any) {
		const sids = this.playerManager
			.getAllEntities()
			.filter((player) => player.spawnedActors.has(ev.playerId))
			.map((player) => player.connId);
		return sids;
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

	@HandleRemoteEvent(ClientEvents.ToggleUsingEvent)
	private handleToggleUsingEvent(connId: string, event: ClientEvents.ToggleUsingEvent) {
		if (event.startOrEnd) {
			this.playerManager.startUsing(event.playerId);
		} else {
			this.playerManager.endUsing(event.playerId);
		}
	}
}
