import { TextureProvider } from '@uni.js/texture';
import { BRICK_WIDTH } from './brick';
import { CompositeRectTileLayer } from '@pixi/tilemap';
import { StaticObject } from '../objects/static-object';
import { LandData } from '../../server/land/land';
import { Vector2 } from '../../server/utils/vector2';
import { BrickType } from '../../server/bricks';

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
			this.tileLayer.tile(texture, brick.x * BRICK_WIDTH, brick.y * BRICK_WIDTH,);
			this.layersMap.set(new Vector2(brick.x, brick.y).toHash(), layers);
		}
	}

	placeLayer(offPos: Vector2, brickType: BrickType) {
		const layers = this.layersMap.get(offPos.toHash());
		layers.push(brickType);
	}

	removeLayer(offPos: Vector2) {
		const layers = this.layersMap.get(offPos.toHash());
		layers.pop();
	}

	getSurfaceLayer(offPos: Vector2) {
		const layers = this.layersMap.get(offPos.toHash());
		return layers[layers.length - 1];
	}

	getLandPos() {
		return this.landPos;
	}

	getBrickByOffset(offLoc: Vector2) {}
}
