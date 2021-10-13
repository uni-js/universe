import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { Player } from '../object/player';
import { GameController } from '../system/controller';
import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

import * as ServerEvents from '../../server/event/external';
import { HandleExternalEvent } from '../../event/spec';

@injectable()
export class PlayerController extends GameController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);

		this.redirectToRemoteEvent(this.playerManager, Events.ControlMovedEvent, ExternalEvents.ControlMovedEvent);
	}

	@HandleExternalEvent(ServerEvents.LoginedEvent)
	private handleLogined(event: ServerEvents.LoginedEvent) {
		console.debug('logined_event', event);
		const actorId = event.actorId;
		const player = this.actorManager.getObjectById(actorId) as Player;
		this.playerManager.setCurrentPlayer(player);
	}
}
