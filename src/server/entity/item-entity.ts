import { Entity, Index, Property } from '@uni.js/database';
import { ActorType } from '../types/actor';
import { ItemHoldAction, ItemType } from '../types/item';

@Entity()
export class Item {
	@Index()
	@Property()
	itemType: ItemType;

	@Property()
	holdAction: ItemHoldAction = ItemHoldAction.NONE;

	@Property()
	specActorType?: ActorType;
}

export const ItemDefList: Item[] = [
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
