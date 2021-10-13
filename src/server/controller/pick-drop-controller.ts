import { inject, injectable } from 'inversify';
import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { ServerController } from '../shared/controller';
import { Vector2 } from '../shared/math';
import * as ClientEvents from '../../client/event/external';
import { HandleExternalEvent } from '../../event/spec';

@injectable()
export class PickDropController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
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
