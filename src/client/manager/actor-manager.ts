import { inject, injectable } from 'inversify';
import { Direction } from '../../server/actor/spec';
import { ActorObject } from '../object/actor';
import { GameObjectManager } from '../system/manager';
import { ActorStore, ActorContainer } from '../shared/store';
import * as Events from '../event/internal';

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ActorContainer) private actorContainer: ActorContainer) {
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

		actor.vPos = targetActor.vPos.add(relPos);
	}

	damageActor(actorId: number, finalHealth: number) {
		const actor = this.getObjectById(actorId);
		actor.damage(finalHealth);
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);

		for (const actor of this.actorStore.getAll()) {
			this.updateAttachingMovement(actor);
		}

		this.actorContainer.sortChildren();
	}
}
