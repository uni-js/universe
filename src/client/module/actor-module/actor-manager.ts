import { inject, injectable } from 'inversify';
import { Direction, RunningState } from '../../../server/module/actor-module/spec';
import { ActorObject } from './actor-object';
import { GameObjectManager } from '@uni.js/client';
import { ActorLayer } from '../../store';

export interface ActorManagerEvents {
	ActorToggleUsingEvent: {
		actorId: number;
		startOrEnd: boolean;
	};
	ActorToggleWalkEvent: {
		actorId: number;
		running: RunningState;
		direction: Direction;
	};
}

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorLayer) private actorLayer: ActorLayer) {
		super(actorLayer);

		this.redirectObjectEvent('ActorToggleUsingEvent');
		this.redirectObjectEvent('ActorToggleWalkEvent');
	}

	/**
	 * actors which are loaded locally
	 */
	getAllActors() {
		return this.actorLayer.getAll();
	}

	private updateAttachingMovement(actor: ActorObject) {
		if (!actor.attaching) return;
		const targetActor = this.getObjectById(actor.attaching.actorId);
		if (!targetActor) return;

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

	doUpdateTick(tick: number) {
		super.doUpdateTick.call(this, tick);
		this.actorLayer.container.sortChildren();
	}

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick.call(this, tick);
		for (const actor of this.actorLayer.getAll()) {
			this.updateAttachingMovement(actor);
		}
	}
}
