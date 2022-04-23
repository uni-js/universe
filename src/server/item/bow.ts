import { Item } from './item';
import { ItemType } from './item-type';
import { Arrow } from '../actor/arrow';
import { Vector2 } from '../utils/vector2';

export class Bow extends Item {

	getType(): ItemType {
		return ItemType.BOW;
	}

	stopUsing(): void {
		const player = this.shortcut.getPlayer();
		const arrow = new Arrow({shooter: player.getId()}, player.getPos().add(player.getHandPos()), this.server);
		const vec = player.getDirectionVector();
		arrow.setMotion(vec.mul(5));

		this.world.addActor(arrow);
	}
}
