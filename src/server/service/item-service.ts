import { EventBus } from '../../event/bus-server';
import { ShortcutSelectEvent } from '../../event/client-side';
import { ItemManager } from '../manager/item-manager';
import { PlayerManager } from '../manager/player-manager';

export class ItemService {
	constructor(private eventBus: EventBus, private playerManager: PlayerManager, private itemManager: ItemManager) {
		this.eventBus.on(ShortcutSelectEvent.name, this.onShortcutSelected);
	}
	private onShortcutSelected = (connId: string, index: number) => {};
}
