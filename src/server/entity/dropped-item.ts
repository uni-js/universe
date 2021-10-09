import { Actor, ActorType } from '../actor/spec';
import { ItemType } from '../item';
import { CtorOption } from '../shared/entity';

export class DroppedItemActor extends Actor {
	type = ActorType.DROPPED_ITEM;

	@CtorOption()
	itemType: ItemType;

	@CtorOption()
	sizeX = 0.5;

	@CtorOption()
	sizeY = 0.5;
}
