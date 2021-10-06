import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { MovePlayerEvent } from '../../event/client-side';
import { LoginedEvent } from '../../event/server-side';
import { Vector2 } from '../../server/shared/math';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { Player } from '../object/player';
import { GameEvent } from '../event';

@injectable()
export class PlayerController {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		this.eventBus.on(LoginedEvent.name, this.handleLogined);

		this.playerManager.on(GameEvent.ControlMovedEvent, this.onControlMoved);
	}

	private onControlMoved = (pos: Vector2) => {
		this.eventBus.emitEvent(new MovePlayerEvent(pos.x, pos.y));
	};
	private handleLogined = (event: LoginedEvent) => {
		console.debug('logined_event', event);
		const actorId = event.actorId;
		const player = this.actorManager.getObjectById(actorId) as Player;
		this.playerManager.setCurrentPlayer(player);
	};
}
