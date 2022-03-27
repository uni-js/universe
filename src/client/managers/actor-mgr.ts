import { inject, injectable } from 'inversify';
import { ActorObject } from '../objects/actor-object';
import { GameObjectManager } from '@uni.js/client';
import { ActorStore } from '../store';
import { EmitObjectEvent } from '@uni.js/event';
import { Direction, RunningState } from '../../server/types/actor';

export interface ActorMgrEvents {
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
export class ActorMgr extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore) {
		super(actorStore);
	}

	@EmitObjectEvent('ActorToggleWalkEvent')
	private emitObjectEvent() {}

	/**
	 * actors which are loaded locally
	 */
	getAllActors() {
		return this.actorStore.getAll();
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
		this.actorStore.container.sortChildren();
	}

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick.call(this, tick);
		for (const actor of this.actorStore.getAll()) {
			const attchingActor = this.getObjectById(actor.attaching);
			actor.updateAttachingMovement(attchingActor);
		}
	}
}
