import { Actor, ActorType } from '../actor-module/spec';
import { ItemType } from '../inventory-module/item-entity';
import { ConstructOption } from '../../shared/entity';

export class DroppedItemActor extends Actor {
	type = ActorType.DROPPED_ITEM;

	@ConstructOption()
	itemType: ItemType;

	@ConstructOption()
	sizeX = 0.5;

	@ConstructOption()
	sizeY = 0.5;
}
