import { Actor, ActorType } from '../actor-module/spec';
import { ItemType } from '../inventory-module/item-entity';
import { ConstructOption } from '../../shared/entity';

export class DroppedItemActor extends Actor {
	type = ActorType.DROPPED_ITEM;

	@ConstructOption()
	itemType: ItemType;

	@ConstructOption()
	itemCount = 1;

	@ConstructOption()
	sizeX = 0.7;

	@ConstructOption()
	sizeY = 0.7;
}
