import * as PIXI from 'pixi.js';
import { GameObject } from '../../../framework/client-side/game-object';
import { TextureProvider } from '../../../framework/client-side/texture';
import { Vector2 } from '../../../server/shared/math';

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
