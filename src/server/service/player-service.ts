import { EventBus } from '../../event/bus-server';
import { LoginEvent, MovePlayerEvent, SetPlayerStateEvent } from '../../event/client-side';
import { AddActorEvent, LoginedEvent, RemoveActorEvent } from '../../event/server-side';
import { Player } from '../entity/player';
import { PlayerManager } from '../manager/player-manager';
import { Vector2 } from '../shared/math';
import { Service } from '../shared/service';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { ActorManager } from '../manager/actor-manager';

@injectable()
export class PlayerService implements Service {
	constructor(
		@inject(EventBus) private eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		this.eventBus.on(LoginEvent.name, this.handleLogin.bind(this));
		this.eventBus.on(MovePlayerEvent.name, this.handleMovePlayer.bind(this));
		this.eventBus.on(SetPlayerStateEvent.name, this.handleSetActorState.bind(this));

		this.playerManager.on(GameEvent.SpawnActorEvent, this.onActorSpawned.bind(this));
		this.playerManager.on(GameEvent.DespawnActorEvent, this.onActorDespawned.bind(this));
	}
	private handleSetActorState(connId: string, event: SetPlayerStateEvent) {
		const player = this.playerManager.findEntity({ connId });

		this.actorManager.setWalkState(player.$loki, event.running, event.dir);
	}
	private onActorSpawned(actorId: number, player: Player) {
		const actor = this.actorManager.getEntityById(actorId);
		const event = new AddActorEvent(actor.type, {
			serverId: actor.$loki,
			posX: actor.posX,
			posY: actor.posY,
			playerName: player.playerName,
		});

		this.eventBus.emitTo([player.connId], event);
	}
	private onActorDespawned(actorId: number, player: Player) {
		const event = new RemoveActorEvent(actorId);
		this.eventBus.emitTo([player.connId], event);
	}
	private handleLogin(connId: string) {
		const player = this.playerManager.addNewPlayer({
			connId,
			posX: 0,
			posY: 0,
		});

		this.eventBus.emitTo([connId], new LoginedEvent(player.$loki));
		console.log(`user logined :`, player.connId);
	}
	private handleMovePlayer(connId: string, event: MovePlayerEvent) {
		const player = this.playerManager.findEntity({ connId });
		this.actorManager.moveToPosition(player, new Vector2(event.x, event.y));
	}

	doTick(): void {}
}
