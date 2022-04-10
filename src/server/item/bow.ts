import { Item } from './item';
import { ItemType } from './item-type';
import { Bow as BowActor } from '../actor/bow';
import { Actor, DirectionType } from '../actor/actor';
import { Arrow } from '../actor/arrow';
import { Vector2 } from '../utils/vector2';

export class Bow extends Item {
	private actor: Actor | undefined;

	getType(): ItemType {
		return ItemType.BOW;
	}

	hold(): void {
		const player = this.shortcut.getPlayer();
		const actor = new BowActor({}, player.getPos(), this.server);
		this.actor = actor;
		this.world.addActor(actor);

		actor.attach(player);
	}

	unhold(): void {
		this.world.removeActor(this.actor);
		this.actor = undefined;
	}

	stopUsing(): void {
		const player = this.shortcut.getPlayer();
		const arrow = new Arrow({}, player.getPos().add(player.getAttachPos()), this.server);
		const vec = player.getDirectionVector();
		arrow.setMotion(vec.mul(5));

		this.world.addActor(arrow);
	}
}
