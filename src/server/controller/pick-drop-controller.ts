import { inject, injectable } from 'inversify';
import { EventBusServer, EventBusServerSymbol } from '../../framework/bus-server';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { ServerSideController } from '../../framework/server-controller';
import { Vector2 } from '../shared/math';
import * as ClientEvents from '../../client/event/external';
import { HandleExternalEvent } from '../../framework/event';

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
}
