import { ItemType } from './item-type';
import type { Item } from './item';
import { Bow } from './bow';
import { EmptyItem } from './empty';
import { BuildingPlanter } from './building-planter';

export type ItemImpl = new (...args: any[]) => Item;

export class ItemFactory {
	private impls = new Map<ItemType, ItemImpl>();
	constructor() {
		this.addItem(Bow);
		this.addItem(EmptyItem);
		this.addItem(BuildingPlanter);
	}

	addItem(impl: ItemImpl) {
		const type = impl.prototype.getType();
		this.impls.set(type, impl);
	}

	getNewItem(itemType: ItemType, ...args: any[]) {
		const impl = this.impls.get(itemType);
		if (!impl) {
			return undefined;
		}
		return new impl(...args);
	}
}

export const itemFactory = new ItemFactory();
