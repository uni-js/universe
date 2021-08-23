import { inject, injectable } from 'inversify';
import { ActorObject, BuildActorObjectHash } from '../shared/game-object';
import { StoreManager } from '../shared/manager';
import { ActorStore, ObjectContainer } from '../shared/store';

@injectable()
export class ActorManager extends StoreManager {
	constructor(@inject(ActorStore) private actorStore: ActorStore, @inject(ObjectContainer) private objectContainer: ObjectContainer) {
		super();
	}
	addActor(item: ActorObject) {
		console.log('add actor', item, this);
		this.actorStore.add(item);
	}
	getActorById(objectId: string) {
		return this.actorStore.get(BuildActorObjectHash(objectId));
	}
	removeActor(item: ActorObject) {
		console.log('remove actor', item);
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
