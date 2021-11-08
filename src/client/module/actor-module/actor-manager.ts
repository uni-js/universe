import { inject, injectable } from 'inversify';
import { Direction } from '../../../server/module/actor-module/spec';
import { ActorObject } from './actor';
import { GameObjectManager } from '../../../framework/client-side/client-manager';
import { ActorStore } from '../../store';

import * as Events from '../../event/internal';

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore) {
		super(actorStore);

		this.redirectObjectEvent(Events.ActorToggleUsingEvent);
		this.redirectObjectEvent(Events.ActorToggleWalkEvent);
	}

	private updateAttachingMovement(actor: ActorObject) {
		if (!actor.attaching) return;

		const targetActor = this.getObjectById(actor.attaching.actorId);
		const relPos = targetActor.getAttachRelPos(actor.attaching.key);
		const direction = targetActor.direction;

		if (direction == Direction.BACK) {
			actor.zIndex = 1;
		} else if (direction == Direction.LEFT) {
			actor.zIndex = 3;
		} else if (direction == Direction.RIGHT) {
			actor.zIndex = 3;
		} else {
			actor.zIndex = 3;
		}

		actor.vPos = targetActor.vPos.add(relPos);
	}

	damageActor(actorId: number, finalHealth: number) {
		const actor = this.getObjectById(actorId);
		actor.damage(finalHealth);
	}

	setRotation(actorId: number, rotation: number) {
		const actor = this.getObjectById(actorId);
		actor.spriteRotation = rotation;
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);

		for (const actor of this.actorStore.getAll()) {
			this.updateAttachingMovement(actor);
		}

		this.actorStore.container.sortChildren();
	}
}
