import { EventEmitter2 } from 'eventemitter2';
import { HashedStore, HashItem } from '../../shared/store';
import { doTickable } from '../../shared/update';
import { IGameObject } from './game-object';

export interface IGameManager extends doTickable, EventEmitter2 {}

export abstract class GameManager extends EventEmitter2 implements IGameManager {
	async doTick(tick: number): Promise<void> {}
}

/**
 * 用于管理某种游戏对象的管理器
 */
export class GameObjectManager<T extends IGameObject> extends GameManager {
	constructor(private objectStore: HashedStore<T>) {
		super();
	}

	addGameObject(gameObject: T) {
		this.objectStore.add(gameObject);
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
