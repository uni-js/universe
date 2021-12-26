import { Entity } from '@uni.js/server';
import { ActorType } from '../actor-module/spec';
import { ItemType, ItemHoldAction } from "./spec"

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
