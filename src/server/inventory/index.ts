import { ItemType } from '../module/inventory-module/item';

export const BLOCKS_PER_PLAYER_INVENTORY_CONTAINER = 20;
export const BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER = 5;

export interface ContainerUpdateDataUnit {
	index: number;
	itemType: ItemType;
	count: number;
}

export interface ContainerUpdateData {
	units: ContainerUpdateDataUnit[];
}

export enum ContainerType {
	SIMPLE_CONTAINER,

	/**
	 * 玩家背包主仓
	 */
	PLAYER_MAIN_CONTAINER,

	/**
	 * 快捷栏
	 */
	SHORTCUT_CONTAINER,

	/**
	 * 当前查看的容器
	 */
	CURRENT_WATCH_CONTAINER,
}
