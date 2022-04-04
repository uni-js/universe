import { TextureProvider } from '@uni.js/texture';
import { BRICK_WIDTH } from './brick';
import { CompositeRectTileLayer } from '@pixi/tilemap';
import { StaticObject } from '../objects/static-object';
import { LandData } from '../../server/land/land';
import { Vector2 } from '../../server/utils/vector2';
import { BrickType } from '../../server/bricks';

function getBrickKey(x: number, y: number) {
	return `${x}:${y}`;
}

export class LandObject extends StaticObject {
	private tileLayer: CompositeRectTileLayer;
	private layersMap = new Map<string, number[]>();

	constructor(textureProvider: TextureProvider, initLandData: LandData, objectId: number, private landPos: Vector2) {
		super(textureProvider, objectId, new Vector2(1, 1), landPos.mul(32));
		this.zIndex = 0;

		this.tileLayer = new CompositeRectTileLayer();
		this.tileLayer.scale.set(1 / BRICK_WIDTH, 1 / BRICK_WIDTH);

		this.addChild(this.tileLayer);

		this.initLandData(initLandData);
	}

	private initLandData(landData: LandData) {
		for (const [, brick] of landData.bricks.entries()) {
			const layers = brick.layers;
			const surface = layers[layers.length - 1];
			const texture = this.textureProvider.get(`brick.${surface}`);
			this.tileLayer.addFrame(texture, brick.x * BRICK_WIDTH, brick.y * BRICK_WIDTH);
			this.layersMap.set(getBrickKey(brick.x, brick.y), layers);
		}
	}

	placeLayer(offX: number, offY: number, brickType: BrickType) {
		const layers = this.layersMap.get(getBrickKey(offX, offY));
		layers.push(brickType);
	}

	removeLayer(offX: number, offY: number) {
		const layers = this.layersMap.get(getBrickKey(offX, offY));
		layers.pop();
	}

	getSurfaceLayer(offX: number, offY: number) {
		const layers = this.layersMap.get(getBrickKey(offX, offY));
		return layers[layers.length - 1];
	}

	getLandPos() {
		return this.landPos;
	}

	getBrickByOffset(offLoc: Vector2) {}
}
