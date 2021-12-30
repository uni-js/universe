import { Actor } from '../actor-module/actor-entity';
import { ActorType } from '../actor-module/spec';
import { ItemType } from '../inventory-module/spec';
import { Entity, Property } from '@uni.js/database';

@Entity()
export class DroppedItemActor extends Actor {
	@Property()
	type = ActorType.DROPPED_ITEM;

	@Property()
	itemType: ItemType;

	@Property()
	itemCount = 1;

	@Property()
	sizeX = 0.7;

	@Property()
	sizeY = 0.7;
}
