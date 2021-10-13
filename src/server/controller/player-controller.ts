import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { PlayerManager } from '../manager/player-manager';
import { Vector2 } from '../shared/math';
import { Controller } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../manager/actor-manager';

import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class PlayerController implements Controller {
	constructor(
		@inject(EventBusSymbol) private eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		this.eventBus.on(ClientEvents.LoginEvent.name, this.handleLogin.bind(this));
		this.eventBus.on(ClientEvents.ControlMovedEvent.name, this.handleMovePlayer.bind(this));
		this.eventBus.on(ClientEvents.ActorToggleWalkEvent.name, this.handleActorToggleWalk.bind(this));

		this.playerManager.onEvent(Events.SpawnActorEvent, this.onActorSpawned.bind(this));
		this.playerManager.onEvent(Events.DespawnActorEvent, this.onActorDespawned.bind(this));
	}
	private handleActorToggleWalk(connId: string, event: ClientEvents.ActorToggleWalkEvent) {
		const player = this.playerManager.findEntity({ connId });
		if (event.actorId !== player.$loki) return;

		this.actorManager.setWalkState(player.$loki, event.running, event.direction);
	}
	private onActorSpawned(event: Events.SpawnActorEvent) {
		const player = this.playerManager.getEntityById(event.fromPlayerId);
		const actor = this.actorManager.getEntityById(event.actorId);

		const exEvent = new ExternalEvents.AddActorEvent();
		exEvent.type = actor.type;
		exEvent.serverId = actor.$loki;
		exEvent.ctorOption = event.ctorOption;

		this.eventBus.emitTo([player.connId], exEvent);
	}
	private onActorDespawned(event: Events.DespawnActorEvent) {
		const player = this.playerManager.getEntityById(event.fromPlayerId);
		const exEvent = new ExternalEvents.RemoveActorEvent();
		exEvent.actorId = event.actorId;

		this.eventBus.emitTo([player.connId], exEvent);
	}
	private handleLogin(connId: string) {
		const player = this.playerManager.addNewPlayer(connId);
		const event = new ExternalEvents.LoginedEvent();
		event.actorId = player.$loki;

		this.eventBus.emitTo([connId], event);
		console.log(`user logined :`, player.connId);
	}
	private handleMovePlayer(connId: string, event: ClientEvents.ControlMovedEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.moveToPosition(player, new Vector2(event.posX, event.posY), true);
	}

	doTick(): void {}
}
