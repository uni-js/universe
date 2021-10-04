import { inject, injectable } from 'inversify';
import { Vector2 } from '../../server/shared/math';
import { AttachMapping } from '../../shared/actor';
import { ActorObject } from '../shared/actor';
import { GameObjectManager } from '../shared/manager';
import { ActorStore, ActorContainer } from '../shared/store';

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ActorContainer) private actorContainer: ActorContainer) {
		super(actorStore);
	}

	private updateAttachingMovement(actor: ActorObject) {
		const attaching = actor.getAttaching();
		if (!attaching) return;

		const targetActor = this.getObjectById(attaching.actorId);

		const delta = new Vector2(AttachMapping[attaching.key].relativeX, AttachMapping[attaching.key].relativeY);
		actor.setPosition(targetActor.getPosition().add(delta));
	}
	async doTick(tick: number) {
		super.doTick.call(this, tick);

		for (const actor of this.actorStore.getAll()) {
			this.updateAttachingMovement(actor);
		}

		this.actorContainer.sortChildren();
	}
}
