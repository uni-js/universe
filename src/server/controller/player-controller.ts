import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { PlayerManager } from '../manager/player-manager';
import { Vector2 } from '../shared/math';
import { ServerController } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { ActorManager } from '../manager/actor-manager';

import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { HandleExternalEvent, HandleInternalEvent } from '../../event/spec';

@injectable()
export class PlayerController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);
	}

	@HandleInternalEvent('playerManager', Events.SpawnActorEvent)
	private onActorSpawned(event: Events.SpawnActorEvent) {
		const player = this.playerManager.getEntityById(event.fromPlayerId);
		const actor = this.actorManager.getEntityById(event.actorId);

		const exEvent = new ExternalEvents.AddActorEvent();
		exEvent.type = actor.type;
		exEvent.serverId = actor.$loki;
		exEvent.ctorOption = event.ctorOption;

		this.eventBus.emitTo([player.connId], exEvent);
	}

	@HandleInternalEvent('playerManager', Events.DespawnActorEvent)
	private onActorDespawned(event: Events.DespawnActorEvent) {
		const player = this.playerManager.getEntityById(event.fromPlayerId);
		const exEvent = new ExternalEvents.RemoveActorEvent();
		exEvent.actorId = event.actorId;

		this.eventBus.emitTo([player.connId], exEvent);
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
}
