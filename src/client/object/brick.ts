import { Vector2 } from '../../server/shared/math';
import { StaticObject } from '../shared/game-object';
import { TextureContainer } from '../texture';
import * as PIXI from 'pixi.js';
import { LAND_WIDTH } from '../../server/land/const';
import { BrickType } from '../../server/entity/brick';

export class BrickObject extends StaticObject {
	private highlightObject: PIXI.Sprite;

	constructor(
		private brickType: BrickType,
		objectId: number,
		texture: TextureContainer,
		pos: Vector2,
		private landLoc: Vector2,
		private offLoc: Vector2,
	) {
		super(texture, objectId, new Vector2(1, 1), pos, landLoc.mul(LAND_WIDTH).add(offLoc));

		this.highlightObject = PIXI.Sprite.from(this.texture.getOne(`system.brick_highlight`));
		this.highlightObject.width = 1;
		this.highlightObject.height = 1;
		this.highlightObject.visible = false;

		this.addChild(this.highlightObject);

		this.loadTexture();
	}
	setHighLight(bool: boolean) {
		this.highlightObject.visible = bool;
	}
	getHighLight() {
		return this.highlightObject.visible;
	}
	getOffsetLoc() {
		return this.offLoc;
	}
	getLandLoc() {
		return this.landLoc;
	}
	getType() {
		return this.brickType;
	}
	private loadTexture() {
		const texture = this.texture.getOne(`brick.${this.brickType}.normal`);
		if (!texture) throw new Error(`${this.brickType} 的材质未找到`);

		this.sprite.texture = texture;
	}
}
