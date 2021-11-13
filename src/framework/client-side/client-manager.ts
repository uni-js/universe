import { ObjectStore, HashItem } from './object-store';
import { GameEventEmitter, InternalEvent, ClassOf } from '../event';
import { IGameObject } from './game-object';
import { CAN_INJECT_COLLECTION } from '../server-side/memory-database';

export abstract class ClientSideManager extends GameEventEmitter {
	static [CAN_INJECT_COLLECTION] = true;
	constructor() {
		super();
	}

	doTick(tick: number): void {}
}

export class GameObjectManager<T extends IGameObject> extends ClientSideManager {
	private redirectedObjectEvents: ClassOf<InternalEvent>[] = [];

	constructor(private objectStore: ObjectStore<T>) {
		super();
	}

	/**
	 * redirect the event from the specified-type game object
	 */
	protected redirectObjectEvent(eventClass: ClassOf<InternalEvent>) {
		this.redirectedObjectEvents.push(eventClass);
	}

	addGameObject(gameObject: T) {
		this.objectStore.add(gameObject);

		for (const eventClass of this.redirectedObjectEvents) {
			gameObject.onEvent(eventClass, (event: InternalEvent) => {
				this.emitEvent(eventClass, event);
			});
		}
	}

	removeGameObject(gameObject: T) {
		this.objectStore.remove(gameObject);
	}

	getObjectById(objectId: number): T {
		return this.getObjectByHash(objectId);
	}

	getObjectByHash(...hashItems: HashItem[]): T {
		return this.objectStore.get(...hashItems);
	}

	getAllObjects() {
		return this.objectStore.getAll();
	}

	async doTick(tick: number) {
		const objects = this.objectStore.getAll();
		for (const object of objects) {
			await object.doTick(tick);
		}
	}
}
