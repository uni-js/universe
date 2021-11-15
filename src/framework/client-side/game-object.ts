import * as PIXI from 'pixi.js';

import { TextureProvider } from './texture';

export type ClassOf<T> = { new (...args: any[]): T };

export interface IGameObject extends PIXI.DisplayObject {
	getLocalId(): number;
	getServerId(): number;
	onEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
	offEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
	emitEvent<T>(eventClass: ClassOf<T>, event: T): void;
	doUpdateTick(tick: number): void;
	doFixedUpdateTick(tick: number): void;
}

export class GameObject extends PIXI.Container implements IGameObject {
	static objectCount = 0;

	private localId: number;

	constructor(protected texture: TextureProvider, protected serverId?: number) {
		super();
		this.localId = -++GameObject.objectCount;
	}

	onEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void) {
		this.on(eventClass.name, listener);
	}

	offEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void) {
		this.off(eventClass.name, listener);
	}

	emitEvent<T>(eventClass: ClassOf<T>, event: T) {
		this.emit(eventClass.name, event);
	}

	/**
	 * local id of game obejct
	 *
	 * @returns always return negative number
	 */
	getLocalId() {
		return this.localId;
	}

	/**
	 * remote object id
	 * the id is unique and provided by server
	 */
	getServerId(): number {
		return this.serverId;
	}

	doUpdateTick(tick: number): void {}
	doFixedUpdateTick(tick: number): void {}
}
