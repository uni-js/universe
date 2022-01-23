import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { ActorManager } from '../actor-module/actor-manager';
import { PlayerManager } from './player-manager';
import { Player } from './player-object';
import { ClientSideController } from '@uni.js/client';
import * as ExternalEvents from '../../event';

import * as ServerEvents from '../../../server/event';
import { HandleRemoteEvent } from '@uni.js/event';
import { Logger } from '@uni.js/utils';

@injectable()
export class PlayerController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.playerManager, "ControlMovedEvent", ExternalEvents.ControlMovedEvent);
	}

	@HandleRemoteEvent(ServerEvents.LoginedEvent)
	private handleLogined(event: ServerEvents.LoginedEvent) {
		Logger.info('user is logined to server', event);
		const actorId = event.actorId;
		const player = this.actorManager.getObjectById(actorId) as Player;
		this.playerManager.setCurrentPlayer(player);
	}
}
