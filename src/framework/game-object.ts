import * as PIXI from 'pixi.js';

import { doTickable } from './tickable';
import { TextureProvider } from './texture';

export type ClassOf<T> = { new (...args: any[]): T };

export interface IGameObject extends doTickable, PIXI.DisplayObject {
	getLocalId(): number;
	getServerId(): number;
	onEvent<T>(eventClazz: ClassOf<T>, listener: (event: T) => void): void;
	offEvent<T>(eventClazz: ClassOf<T>, listener: (event: T) => void): void;
	emitEvent<T>(eventClazz: ClassOf<T>, event: T): void;
	doTick(tick: number): Promise<void>;
}

export class GameObject extends PIXI.Container implements IGameObject {
	static objectCount = 0;

	private localId: number;

	constructor(protected texture: TextureProvider, protected serverId?: number) {
		super();
		this.localId = -++GameObject.objectCount;
	}

	onEvent<T>(eventClazz: ClassOf<T>, listener: (event: T) => void) {
		this.on(eventClazz.name, listener);
	}
	offEvent<T>(eventClazz: ClassOf<T>, listener: (event: T) => void) {
		this.off(eventClazz.name, listener);
	}

	emitEvent<T>(eventClazz: ClassOf<T>, event: T) {
		this.emit(eventClazz.name, event);
	}
	/**
	 * 游戏对象的本地id
	 *
	 * @returns 为了不与远程id发生冲突, 本地id的返回值恒定为负值
	 */
	getLocalId() {
		return this.localId;
	}
	/**
	 * 游戏对象的id,
	 * 这个id值与服务端是统一且唯一的
	 *
	 * 如果这个对象是纯本地对象, 在服务端没有对应映射,
	 * 则返回本地id
	 */
	getServerId(): number {
		return this.serverId;
	}
	async doTick(tick: number): Promise<void> {}
}
