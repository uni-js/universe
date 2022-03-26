import { ItemType } from './item';

export const BLOCKS_PER_PLAYER_INVENTORY_CONTAINER = 20;
export const BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER = 5;
export const MAX_STACK_SIZE = 20;

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
	 * player backpack main container
	 */
	BACKPACK_CONTAINER,

	/**
	 * player backpack shortcut
	 */
	SHORTCUT_CONTAINER,

	/**
	 * current container watching
	 */
	CURRENT_WATCH_CONTAINER,
}
