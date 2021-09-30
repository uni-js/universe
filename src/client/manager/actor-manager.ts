import { inject, injectable } from 'inversify';
import { ActorObject } from '../shared/game-object';
import { GameObjectManager } from '../shared/manager';
import { ActorStore, ActorContainer } from '../shared/store';

@injectable()
export class ActorManager extends GameObjectManager<ActorObject> {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ActorContainer) private actorContainer: ActorContainer) {
		super(actorStore);
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);

		this.actorContainer.sortChildren();
	}
}
