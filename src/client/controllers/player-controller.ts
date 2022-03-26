import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { ActorMgr } from '../managers/actor-manager';
import { PlayerMgr } from '../managers/player-manager';
import { Player } from '../objects/player-object';
import { ClientSideController } from '@uni.js/client';
import * as ExternalEvents from '../event';

import * as ServerEvents from '../../server/event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { Logger } from '@uni.js/utils';

@injectable()
export class PlayerController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(ActorMgr) private actorMgr: ActorMgr,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('playerMgr', 'ToggleUsingEvent')
	@EmitLocalEvent('playerMgr', 'ControlMovedEvent')
	private emitLocalEvent() {}

	@HandleRemoteEvent(ServerEvents.ToggleUsingEvent)
	private handleToggleUsing(event: ServerEvents.ToggleUsingEvent) {
		const player = <Player>this.actorMgr.getObjectById(event.playerId);
		if (event.startOrEnd) {
			player.startUsing(false);
		} else {
			player.endUsing(false);
		}
	}

	@HandleRemoteEvent(ServerEvents.LoginedEvent)
	private handleLogined(event: ServerEvents.LoginedEvent) {
		Logger.info('user is logined to server', event);
		const actorId = event.actorId;
		const player = this.actorMgr.getObjectById(actorId) as Player;
		this.playerMgr.setCurrentPlayer(player);
	}
}
