import { UIState } from '../../../framework/client-side/user-interface/state';
import { ContainerType } from '../../../server/module/inventory-module/spec';
import { ItemType } from '../../../server/module/inventory-module/item-entity';

@UIState()
export class ShortcutContainerState {
	/**
	 * 已经更新过至少一次
	 */
	firstUpdated = false;
	/**
	 * 快捷栏的容器id
	 */
	containerId: number;

	/**
	 * 当前背包指向的格子坐标
	 */
	currentIndexAt = 0;

	/**
	 * 背包中的格子
	 */
	blocks: InventoryBlockState[];
}

export class InventoryBlockState {
	/**
	 * 来自于容器
	 */
	containerType: ContainerType;

	/**
	 * 格子在背包中的坐标
	 */
	index: number;

	/**
	 * 物品类型
	 */
	itemType: ItemType;

	/**
	 * 物品存储数量
	 */
	itemCount = 0;
}
