import { inject, injectable } from 'inversify';
import { Direction } from '../../server/actor/spec';
import { GameEvent } from '../event';
import { ActorObject } from '../shared/actor';
import { GameObjectManager } from '../shared/manager';
import { ActorStore, ActorContainer } from '../shared/store';

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ActorContainer) private actorContainer: ActorContainer) {
		super(actorStore, {
			emitOutEvents: [GameEvent.ActorToggleUsingEvent, GameEvent.ActorToggleWalkEvent],
		});
	}

	private updateAttachingMovement(actor: ActorObject) {
		const attaching = actor.getAttaching();
		if (!attaching) return;

		const targetActor = this.getObjectById(attaching.actorId);
		const relPos = targetActor.getAttachRelPos(attaching.key);
		const direction = targetActor.getDirection();

		if (direction == Direction.BACK) {
			actor.rotation = (3 * Math.PI) / 2;
			actor.zIndex = 1;
			actor.scale.x = 1;
		} else if (direction == Direction.LEFT) {
			actor.rotation = 0;
			actor.zIndex = 3;
			actor.scale.x = -1;
		} else if (direction == Direction.RIGHT) {
			actor.rotation = 0;
			actor.zIndex = 3;
			actor.scale.x = 1;
		} else {
			actor.rotation = Math.PI / 2;
			actor.zIndex = 3;
			actor.scale.x = 1;
		}

		actor.setPosition(targetActor.getPosition().add(relPos));
	}

	damageActor(actorId: number, finalHealth: number) {
		const actor = this.getObjectById(actorId);
		actor.setHealth(finalHealth);
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);

		for (const actor of this.actorStore.getAll()) {
			this.updateAttachingMovement(actor);
		}

		this.actorContainer.sortChildren();
	}
}
