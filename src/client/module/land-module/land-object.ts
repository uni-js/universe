import { LAND_WIDTH, LandData, BrickTypeName } from '../../../server/module/land-module/spec';
import { Vector2 } from '../../../server/shared/math';
import { TextureProvider } from '@uni.js/texture';
import { BRICK_WIDTH } from './brick-object';
import { CompositeRectTileLayer } from '@pixi/tilemap';
import { StaticObject } from '../actor-module/static';

export class LandObject extends StaticObject {
	private tileLayer: CompositeRectTileLayer;

	constructor(textureProvider: TextureProvider, initLandData: LandData, objectId: number, private landPos: Vector2) {
		super(textureProvider, objectId, new Vector2(1, 1), landPos.mul(LAND_WIDTH));
		this.zIndex = 0;

		this.tileLayer = new CompositeRectTileLayer();
		this.tileLayer.scale.set(1 / BRICK_WIDTH, 1 / BRICK_WIDTH);

		this.addChild(this.tileLayer);

		this.setLandData(initLandData);
	}

	getLandLoc() {
		return this.landPos;
	}

	setLandData(landData: LandData) {
		for (const [, brick] of landData.bricks.entries()) {
			const texture = this.textureProvider.get(`brick.${BrickTypeName[brick.type]}`);
			this.tileLayer.addFrame(texture, brick.offX * BRICK_WIDTH, brick.offY * BRICK_WIDTH);
		}
	}

	getBrickByOffset(offLoc: Vector2) {}
}
