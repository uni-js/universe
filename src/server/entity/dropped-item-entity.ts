import { Actor } from './actor-entity';
import { Entity, Property } from '@uni.js/database';
import { ActorType } from '../types/actor';
import { ItemType } from '../types/item';

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
