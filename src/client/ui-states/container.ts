import { UIState } from '@uni.js/ui';
import { ItemType } from '../../server/item/item-type';

export class ContainerBlock {
	index: number;
	itemType: ItemType;
	itemCount = 0;
}

export class ContainerState {
	/**
	 * already updated once
	 */
	firstUpdated = false;
	/**
	 * shortcut container id
	 */
	containerId: number;

	blocks: ContainerBlock[] = [];
}

@UIState()
export class ShortcutContainerState extends ContainerState {
	currentIndexAt: number = undefined;
}

@UIState()
export class BackpackContainerState extends ContainerState {
	visible = false;
}
