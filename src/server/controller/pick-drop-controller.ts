import { inject, injectable } from 'inversify';
import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { Controller } from '../shared/controller';
import { Vector2 } from '../shared/math';
import * as ClientEvents from '../../client/event/external';

@injectable()
export class PickDropController implements Controller {
	constructor(
		@inject(EventBusSymbol) private eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
	) {
		this.eventBus.on(ClientEvents.DropItemEvent.name, this.handleDropItem);
	}

	private handleDropItem = (connId: string) => {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getShortcut(player);
		const dropAtPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.dropContainerItem(shortcut.$loki, shortcut.currentIndex, dropAtPos);
	};

	doTick() {}
}
