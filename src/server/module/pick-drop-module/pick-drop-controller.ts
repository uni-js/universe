import { inject, injectable } from 'inversify';
import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { InventoryManager } from '../../module/inventory-module/inventory-manager';
import { PlayerManager } from '../../module/player-module/player-manager';
import { ServerSideController } from '@uni.js/server';
import { Vector2 } from '../../shared/math';
import * as ClientEvents from '../../../client/event';
import { HandleRemoteEvent } from '@uni.js/event';

@injectable()
export class PickDropController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
	) {
		super(eventBus);
	}

	@HandleRemoteEvent(ClientEvents.DropItemEvent)
	private handleDropItem(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getShortcut(player);
		const dropAtPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.dropContainerItem(shortcut.id, shortcut.currentIndex, dropAtPos);
	}

	@HandleRemoteEvent(ClientEvents.PickItemEvent)
	private handlePickItem(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getBackpack(player);
		const pickFromPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.pickItemsFromPos(shortcut.id, pickFromPos);
	}
}
