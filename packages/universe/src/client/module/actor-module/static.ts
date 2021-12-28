import * as PIXI from 'pixi.js';
import { GameObject } from '@uni.js/client';
import { TextureProvider } from '@uni.js/texture';
import { Vector2 } from '../../../server/shared/math';

/**
 * static objects in game world
 */
export class StaticObject extends GameObject {
	protected sprite: PIXI.Sprite;
	private worldPos: Vector2;

	constructor(protected textureProvider: TextureProvider, serverId: number, size: Vector2, position: Vector2) {
		super(serverId);

		this.sprite = new PIXI.Sprite();

		this.sprite.width = size.x;
		this.sprite.height = size.y;

		this.setPosition(position);
		this.addChild(this.sprite);
	}

	/**
	 * set world position of the game object
	 */
	setPosition(pos: Vector2) {
		return this.position.set(pos.x, pos.y);
	}

	getPosition() {
		return this.worldPos;
	}
}
