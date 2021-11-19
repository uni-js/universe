import { UIState } from '../../../framework/client-side/user-interface/state';
import { ContainerType } from '../../../server/module/inventory-module/spec';
import { ItemType } from '../../../server/module/inventory-module/item-entity';

@UIState()
export class ShortcutContainerState {
	/**
	 * already updated once
	 */
	firstUpdated = false;
	/**
	 * shortcut container id
	 */
	containerId: number;

	currentIndexAt = 0;

	blocks: InventoryBlockState[];
}

export class InventoryBlockState {
	containerType: ContainerType;

	index: number;

	itemType: ItemType;

	itemCount = 0;
}
