import { inject, injectable } from 'inversify';
import { EventBusServer, EventBusServerSymbol } from '../../../framework/server-side/bus-server';
import { InventoryManager } from '../../module/inventory-module/inventory-manager';
import { PlayerManager } from '../../module/player-module/player-manager';
import { ServerSideController } from '../../../framework/server-side/server-controller';
import { Vector2 } from '../../shared/math';
import * as ClientEvents from '../../../client/event/external';
import { HandleExternalEvent } from '../../../framework/event';

@injectable()
export class PickDropController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
	) {
		super(eventBus);
	}

	@HandleExternalEvent(ClientEvents.DropItemEvent)
	private handleDropItem(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getShortcut(player);
		const dropAtPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.dropContainerItem(shortcut.$loki, shortcut.currentIndex, dropAtPos);
	}

	@HandleExternalEvent(ClientEvents.PickItemEvent)
	private handlePickItem(connId: string) {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getShortcut(player);
		const pickFromPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.pickItemsFromPos(shortcut.$loki, pickFromPos);
	}
}
