import { Entity, Index, Property } from '@uni.js/database';
import { ActorType } from '../actor-module/spec';
import { ItemType, ItemHoldAction } from "./spec"

@Entity()
export class ItemDef {

	@Index()
	@Property()
	itemType: ItemType;

	@Property()
	holdAction: ItemHoldAction = ItemHoldAction.NONE;

	@Property()
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
