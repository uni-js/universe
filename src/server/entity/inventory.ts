import { Entity } from '../../shared/database/memory';
import { BLOCKS_PER_PLAYER_INVENTORY_CONTAINER, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from '../../shared/inventory';
import { ItemType } from '../../shared/item';

/**
 * 一个inventory拥有多个容器
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
	currentIndex = 0;
}

export class BackpackMainContainer extends Container {
	size = BLOCKS_PER_PLAYER_INVENTORY_CONTAINER;
	containerType = ContainerType.PLAYER_MAIN_CONTAINER;
}

export const InventoryEntities = [Inventory, Container, ContainerBlock];
