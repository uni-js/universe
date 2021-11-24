import { InternalEvent } from '../../../framework/event';
import { ItemType } from '../../../server/module/inventory-module/item-entity';

export class SetShortcutIndexEvent extends InternalEvent {
	containerId: number;
	indexAt: number;
	itemType: ItemType;
}
