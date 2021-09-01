import { LAND_WIDTH } from '../../server/land/const';
import { LandData } from '../../server/land/types';
import { Vector2 } from '../../server/shared/math';
import { StaticObject } from '../shared/game-object';
import { TextureContainer } from '../texture';
import { BRICK_WIDTH } from './brick';
import { CompositeRectTileLayer } from '@pixi/tilemap';

export class LandObject extends StaticObject {
	private tileLayer: CompositeRectTileLayer;

	constructor(initLandData: LandData, texture: TextureContainer, objectId: number, private landLoc: Vector2) {
		super(texture, objectId, new Vector2(1, 1), landLoc.mul(LAND_WIDTH), landLoc.mul(LAND_WIDTH));
		this.zIndex = 0;

		this.tileLayer = new CompositeRectTileLayer();
		this.tileLayer.scale.set(1 / BRICK_WIDTH, 1 / BRICK_WIDTH);

		this.addChild(this.tileLayer);

		this.setLandData(initLandData);
	}
	getLandLoc() {
		return this.landLoc;
	}

	setLandData(landData: LandData) {
		for (const [, brick] of landData.bricks.entries()) {
			const texture = this.texture.getOne(`brick.${brick.type}.normal`);
			this.tileLayer.addFrame(texture, brick.offX * BRICK_WIDTH, brick.offY * BRICK_WIDTH);
		}
	}

	getBrickByOffset(offLoc: Vector2) {}
}
