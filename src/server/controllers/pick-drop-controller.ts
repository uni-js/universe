import { inject, injectable } from 'inversify';
import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { InventoryMgr } from '../managers/inventory-mgr';
import { PlayerMgr } from '../managers/player-mgr';
import { ServerSideController } from '@uni.js/server';
import { Vector2 } from '../utils/math';
import * as ClientEvents from '../../client/event';
import { HandleRemoteEvent } from '@uni.js/event';

@injectable()
export class PickDropController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(InventoryMgr) private inventoryMgr: InventoryMgr,
	) {
		super(eventBus);
	}

	@HandleRemoteEvent(ClientEvents.DropItemEvent)
	private handleDropItem(connId: string) {
		const player = this.playerMgr.findEntity({ connId });
		const shortcut = this.inventoryMgr.getShortcut(player);
		const dropAtPos = new Vector2(player.posX, player.posY);
		this.inventoryMgr.dropContainerItem(shortcut.id, shortcut.currentIndex, dropAtPos);
	}

	@HandleRemoteEvent(ClientEvents.PickItemEvent)
	private handlePickItem(connId: string) {
		const player = this.playerMgr.findEntity({ connId });
		const shortcut = this.inventoryMgr.getBackpack(player);
		const pickFromPos = new Vector2(player.posX, player.posY);
		this.inventoryMgr.pickItemsFromPos(shortcut.id, pickFromPos);
	}
}
