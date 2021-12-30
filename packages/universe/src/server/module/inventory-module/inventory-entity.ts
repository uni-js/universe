import { Entity, Index, Property } from '@uni.js/database';
import { BLOCKS_PER_PLAYER_INVENTORY_CONTAINER, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from './spec';
import { ItemType } from './spec';

/**
 * one inventory contains multi containers
 */
@Entity()
export class Inventory {
	@Property()
	containers: number[];
}

@Entity()
export class PlayerInventory extends Inventory {
	@Property()
	containers: [number, number];

	@Index()
	@Property()
	playerId: number;
}

@Entity()
export class Container {
	id : number;

	@Property()
	containerType = ContainerType.SIMPLE_CONTAINER;

	@Property()
	size: number;
}

@Index(["containerId", "index"])
@Entity()
export class ContainerBlock {
	@Index()
	@Property()
	containerId: number;

	@Property()
	index: number;

	@Property()
	itemType: ItemType = ItemType.EMPTY;

	@Property()
	itemCount = 0;
}

@Index(["playerId", "currentIndex"])
@Entity()
export class ShortcutContainer extends Container {
	@Property()
	containerType = ContainerType.SHORTCUT_CONTAINER;

	@Property()
	size = BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER;

	@Property()
	currentIndex: number = undefined;

	@Index()
	@Property()
	playerId: number;
}

@Entity()
export class BackpackContainer extends Container {
	@Property()
	size = BLOCKS_PER_PLAYER_INVENTORY_CONTAINER;

	@Property()
	containerType = ContainerType.BACKPACK_CONTAINER;

	@Index()
	@Property()
	playerId: number;
}

export const InventoryEntities = [Inventory, Container, ContainerBlock];
