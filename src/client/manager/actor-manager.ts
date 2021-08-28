import { inject, injectable } from 'inversify';
import { ActorObject } from '../shared/game-object';
import { StoreManager } from '../shared/manager';
import { ActorStore, ObjectContainer } from '../shared/store';

@injectable()
export class ActorManager extends StoreManager {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ObjectContainer) private objectContainer: ObjectContainer) {
		super();
	}
	addActor(item: ActorObject) {
		this.actorStore.add(item);
	}
	getActorById(objectId: number) {
		return this.actorStore.get(objectId);
	}
	removeActor(item: ActorObject) {
		this.actorStore.remove(item);
	}
	private async doActorsTick(tick: number) {
		const actors = this.actorStore.getAll();
		for (const actor of actors) {
			await actor.doTick(tick);
		}
	}
	async doTick(tick: number) {
		await this.doActorsTick(tick);

		this.objectContainer.sortChildren();
	}
}
