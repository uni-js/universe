import { Entity } from '../../database/memory';
import { ActorType } from '../actor/spec';

export enum ItemType {
	EMPTY = 'empty',
	BOW = 'bow',
}

export enum ItemHoldAction {
	/**
	 * 什么都不做
	 */
	NONE,
	/**
	 * 附着一个特有的Actor
	 */
	ATTACH_SPEC_ACTOR,
	/**
	 * 附着一个物品Actor
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
