import * as PIXI from 'pixi.js';

import { Vector2 } from '../../server/shared/math';

import { doTickable } from '../../shared/update';
import { TextureProvider } from '../texture';

export interface IGameObject extends doTickable, PIXI.DisplayObject {
	getLocalId(): number;
	getServerId(): number;
	doTick(tick: number): Promise<void>;
}

export enum GameObjectEvent {}

export class GameObject extends PIXI.Container implements IGameObject {
	static objectCount = 0;

	private localId: number;

	constructor(protected texture: TextureProvider, protected serverId?: number) {
		super();
		this.localId = -++GameObject.objectCount;
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

/**
 * 游戏世界里一类长期处于静态的事物
 */
export class StaticObject extends GameObject {
	protected sprite: PIXI.Sprite;
	private worldPos: Vector2;

	constructor(texture: TextureProvider, serverId: number, size: Vector2, position: Vector2) {
		super(texture, serverId);

		this.sprite = new PIXI.Sprite();

		this.sprite.width = size.x;
		this.sprite.height = size.y;

		this.setPosition(position);
		this.addChild(this.sprite);
	}

	/**
	 * 设置游戏对象的世界坐标
	 */
	setPosition(pos: Vector2) {
		return this.position.set(pos.x, pos.y);
	}

	/**
	 * 获取游戏对象的世界坐标
	 */
	getPosition() {
		return this.worldPos;
	}
}
