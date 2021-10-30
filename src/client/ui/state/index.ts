import { UIState } from '../../../framework/user-interface/state';
import { ContainerType } from '../../../server/inventory';
import { ItemType } from '../../../server/item';

@UIState()
export class PlayerState {
	/**
	 * 玩家名
	 */
	playerName: string;

	/**
	 * 玩家角色id
	 */
	actorId: number;
}

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

@UIState()
export class BowUsingState {
	isUsing = false;
	/**
	 * 力度, 从 0 到 1
	 */
	power = 0;

	/**
	 * 弓是否已经可以释放了
	 */
	canRelease = false;
}

export const UIStates = [PlayerState, ShortcutContainerState, BowUsingState];
