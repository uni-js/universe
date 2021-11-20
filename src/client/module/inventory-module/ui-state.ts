import { UIState } from '../../../framework/client-side/user-interface/state';
import { ContainerType } from '../../../server/module/inventory-module/spec';
import { ItemType } from '../../../server/module/inventory-module/item-entity';

export class ContainerState {
	/**
	 * already updated once
	 */
	firstUpdated = false;
	/**
	 * shortcut container id
	 */
	containerId: number;

	blocks: InventoryBlockState[] = [];
}

@UIState()
export class ShortcutContainerState extends ContainerState {
	currentIndexAt = 0;
}

export class InventoryBlockState {
	containerType: ContainerType;

	index: number;

	itemType: ItemType;

	itemCount = 0;
}

@UIState()
export class BackpackContainerState extends ContainerState {
	visible = false;
}
