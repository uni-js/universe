import { Entity } from '../../../framework/server-side/memory-database';
import { ActorType } from '../actor-module/spec';

export enum ItemType {
	EMPTY,
	BOW,
	WP_ROCK,
}

export enum ItemTypeName {
	'empty',
	'bow',
	'wp_rock',
}

export const ToolsItemTypes: ItemType[] = [ItemType.BOW];
export const WallpaperTypes: ItemType[] = [ItemType.WP_ROCK];

export enum ItemHoldAction {
	/**
	 * do nothing
	 */
	NONE,
	/**
	 * attach the actor specified
	 */
	ATTACH_SPEC_ACTOR,
	/**
	 * attach the item actor specified
	 */
	ATTACH_ITEM_ACTOR,
}

export class ItemDef extends Entity {
	itemType: ItemType;
	holdAction: ItemHoldAction = ItemHoldAction.NONE;
	specActorType?: ActorType;
}

export const ItemDefList: ItemDef[] = [
	{
		itemType: ItemType.EMPTY,
		holdAction: ItemHoldAction.NONE,
	},
	{
		itemType: ItemType.BOW,
		holdAction: ItemHoldAction.ATTACH_SPEC_ACTOR,
		specActorType: ActorType.BOW,
	},
];
