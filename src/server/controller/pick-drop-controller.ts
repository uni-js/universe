import { inject, injectable } from 'inversify';
import { EventBus } from '../../event/bus-server';
import { DropItemEvent } from '../../event/client-side';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { Controller } from '../shared/controller';
import { Vector2 } from '../shared/math';

@injectable()
export class PickDropController implements Controller {
	constructor(
		@inject(EventBus) private eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
	) {
		this.eventBus.on(DropItemEvent.name, this.handleDropItem);
	}

	private handleDropItem = (connId: string) => {
		const player = this.playerManager.findEntity({ connId });
		const shortcut = this.inventoryManager.getShortcut(player);
		const dropAtPos = new Vector2(player.posX, player.posY);
		this.inventoryManager.dropContainerItem(shortcut.$loki, shortcut.currentIndex, dropAtPos);
	};

	doTick() {}
}
