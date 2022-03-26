import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { Logger } from '@uni.js/utils';

import { PlayerMgr } from '../managers/player-mgr';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { ActorMgr } from '../managers/actor-mgr';
import { EmitLocalEvent, HandleEvent, HandleRemoteEvent } from '@uni.js/event';

import * as ClientEvents from '../../client/event';

import * as ExternalEvents from '../event';

@injectable()
export class PlayerController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(ActorMgr) private actorMgr: ActorMgr,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('playerMgr', 'SpawnActorEvent')
	@EmitLocalEvent('playerMgr', 'DespawnActorEvent')
	private emitToPlayer(ev: any) {
		return this.playerMgr.getEntityById(ev.fromPlayerId).connId;
	}

	@EmitLocalEvent('playerMgr', 'ToggleUsingEvent')
	private emitToPlayerNearActors(ev: any) {
		const sids = this.playerMgr
			.getAllEntities()
			.filter((player) => player.spawnedActors.has(ev.playerId))
			.map((player) => player.connId);
		return sids;
	}

	@HandleRemoteEvent(ClientEvents.ActorToggleWalkEvent)
	private handleActorToggleWalk(connId: string, event: ClientEvents.ActorToggleWalkEvent) {
		const player = this.playerMgr.findEntity({ connId });
		if (event.actorId !== player.id) return;

		this.actorMgr.setWalkState(player.id, event.running, event.direction);
	}

	@HandleRemoteEvent(ClientEvents.LoginEvent)
	private handleLogin(connId: string) {
		const player = this.playerMgr.addNewPlayer(connId);
		const event = new ExternalEvents.LoginedEvent();
		event.actorId = player.id;

		this.eventBus.emitTo([connId], event);
		Logger.info(`user logined :`, player.playerName, player.connId);
	}

	@HandleRemoteEvent(ClientEvents.ControlMovedEvent)
	private handleMovePlayer(connId: string, event: ClientEvents.ControlMovedEvent) {
		const player = this.playerMgr.findEntity({ connId });
		this.actorMgr.processInput(player.id, event.input);
	}

	@HandleRemoteEvent(ClientEvents.SetAimTargetEvent)
	private handleSetAimTargetEvent(connId: string, event: ClientEvents.SetAimTargetEvent) {
		const player = this.playerMgr.findEntity({ connId });
		this.actorMgr.setAimTarget(player.id, event.rotation);
	}

	@HandleRemoteEvent(ClientEvents.ToggleUsingEvent)
	private handleToggleUsingEvent(connId: string, event: ClientEvents.ToggleUsingEvent) {
		if (event.startOrEnd) {
			this.playerMgr.startUsing(event.playerId);
		} else {
			this.playerMgr.endUsing(event.playerId);
		}
	}
}
