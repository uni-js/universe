import { InternalEvent } from '@uni.js/event';
import { ItemType } from '../../../server/module/inventory-module/spec';

export class SetShortcutIndexEvent extends InternalEvent {
	containerId: number;
	indexAt: number;
	itemType: ItemType;
}
