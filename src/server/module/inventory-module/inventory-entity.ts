import { Entity } from '../../../framework/server-side/memory-database';
import { BLOCKS_PER_PLAYER_INVENTORY_CONTAINER, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from './spec';
import { ItemType } from './item-entity';

/**
 * one inventory contains multi containers
 */
export class Inventory extends Entity {
	containers: number[];
}

export class PlayerInventory extends Inventory {
	containers: [number, number];
	playerId: number;
}

export class Container extends Entity {
	containerType = ContainerType.SIMPLE_CONTAINER;
	size: number;
}

export class ContainerBlock extends Entity {
	containerId: number;
	index: number;
	itemType: ItemType = ItemType.EMPTY;
	itemCount = 0;
}

export class ShortcutContainer extends Container {
	containerType = ContainerType.SHORTCUT_CONTAINER;
	size = BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER;
	currentIndex: number = undefined;
	playerId: number;
}

export class BackpackContainer extends Container {
	size = BLOCKS_PER_PLAYER_INVENTORY_CONTAINER;
	containerType = ContainerType.BACKPACK_CONTAINER;
	playerId: number;
}

export const InventoryEntities = [Inventory, Container, ContainerBlock];
