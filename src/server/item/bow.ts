import { Item } from './item';
import { ItemType } from './item-type';
import { Bow as BowActor } from '../actor/bow';
import type { Actor } from '../actor/actor';

export class Bow extends Item {
	private actor: Actor | undefined;

	getType(): ItemType {
		return ItemType.BOW;
	}

	hold(): void {
		const player = this.shortcut.getPlayer();
		const actor = new BowActor(player.getPos(), this.server);
		this.actor = actor;
		this.world.addActor(actor);

		actor.attach(player);
	}

	unhold(): void {
		this.world.removeActor(this.actor);
		this.actor = undefined;
	}
}
