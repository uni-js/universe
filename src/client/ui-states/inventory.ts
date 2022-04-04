import { UIState } from '@uni.js/ui';
import { ItemType } from '../../server/item/item-type';

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
	currentIndexAt: number = undefined;
}

export class InventoryBlockState {
	index: number;

	itemType: ItemType;

	itemCount = 0;
}

@UIState()
export class BackpackContainerState extends ContainerState {
	visible = false;
}
