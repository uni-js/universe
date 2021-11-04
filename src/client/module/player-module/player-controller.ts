import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../../framework/bus-client';
import { ActorManager } from '../actor-module/actor-manager';
import { PlayerManager } from './player-manager';
import { Player } from './player';
import { ClientSideController } from '../../../framework/client-controller';
import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

import * as ServerEvents from '../../../server/event/external';
import { HandleExternalEvent } from '../../../framework/event';

@injectable()
export class PlayerController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.playerManager, Events.ControlMovedEvent, ExternalEvents.ControlMovedEvent);
	}

	@HandleExternalEvent(ServerEvents.LoginedEvent)
	private handleLogined(event: ServerEvents.LoginedEvent) {
		console.debug('logined_event', event);
		const actorId = event.actorId;
		const player = this.actorManager.getObjectById(actorId) as Player;
		this.playerManager.setCurrentPlayer(player);
	}
}
