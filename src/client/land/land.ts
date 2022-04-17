import { TextureProvider } from '@uni.js/texture';
import { BRICK_WIDTH } from './brick';
import { CompositeRectTileLayer } from '@pixi/tilemap';
import { StaticObject } from '../objects/static-object';
import { BrickData, LandData } from '../../server/land/land';
import { Vector2 } from '../../server/utils/vector2';
import { BrickType } from '../../server/bricks';
import { Texture } from 'pixi.js';
import type { World } from '../world/world';

function posToIndex(x: number, y: number) {
	return y * 32 + x;
}

export class LandObject extends StaticObject {
	private tileLayer: CompositeRectTileLayer;
	private decorateLayer: CompositeRectTileLayer;
	private layersMap = new Map<string, number[]>();
	private decorateMap = new Map<string, boolean>();
	private bricks: BrickData[];

	constructor(private world: World, textureProvider: TextureProvider, private initLandData: LandData, objectId: number, private landPos: Vector2) {
		super(textureProvider, objectId, new Vector2(1, 1), landPos.mul(32));
		this.zIndex = 0;

		this.tileLayer = new CompositeRectTileLayer();
		this.tileLayer.scale.set(1 / BRICK_WIDTH, 1 / BRICK_WIDTH);

		this.decorateLayer = new CompositeRectTileLayer();
		this.decorateLayer.scale.set(1 / BRICK_WIDTH, 1 / BRICK_WIDTH);

		this.addChild(this.tileLayer);
		this.addChild(this.decorateLayer);
	}

	initLand() {
		const bricks = this.initLandData.bricks;
		this.bricks = bricks;

		for (const [, brick] of bricks.entries()) {
			const layers = brick.layers;
			const metas = brick.metas;
			const surface = layers[layers.length - 1];
			const meta = metas[metas.length - 1];
			const texture = this.textureProvider.get(`brick.${surface}.${meta}`);

			this.tileLayer.addFrame(texture, brick.x * BRICK_WIDTH, brick.y * BRICK_WIDTH);			
			this.layersMap.set(new Vector2(brick.x, brick.y).toHash(), layers);
		}

		this.updateDecorating();
	}

	updateDecorating() {
		for(let y = -2; y <= 32 + 2 ; y++)
		for(let x = -2; x <= 32 + 2 ; x++) {
			this.updateBrickDecorating(new Vector2(x, y));
		}
	}

	updateBrickDecorating(offPos: Vector2) {
		const pos = offPos.add(this.landPos.mul(32));
		const height = this.world.getBrickXY(pos.x, pos.y)?.layers.length;

		const leftHeight = this.world.getBrickXY(pos.x - 1, pos.y)?.layers.length;
		const topHeight = this.world.getBrickXY(pos.x, pos.y - 1)?.layers.length;
		const rightHeight = this.world.getBrickXY(pos.x + 1, pos.y)?.layers.length;
		const bottomHeight = this.world.getBrickXY(pos.x, pos.y + 1)?.layers.length;

		const leftDown = leftHeight && leftHeight < height;
		const rightDown = rightHeight && rightHeight < height 
		const topDown = topHeight && topHeight < height
		const bottomDown = bottomHeight && bottomHeight  < height	

		const leftUp = leftHeight && leftHeight > height;
		const rightUp = rightHeight && rightHeight > height 
		const topUp = topHeight && topHeight > height
		const bottomUp = bottomHeight && bottomHeight  > height	

		if (leftDown && topDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.lefttop`))
		} else if(leftDown && bottomDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.leftbottom`))
		} else if(rightDown && bottomDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.rightbottom`))
		} else if (rightDown && topDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.righttop`))			
		} else if (leftDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.left`))
		} else if (rightDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.right`))
		} else if (topDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.top`))
		} else if (bottomDown) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.bottom`))
		}


		if (leftUp) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.leftshadow`))
		}

		if (topUp) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.topshadow`))
		}

		if (bottomUp) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.bottomshadow`))
		}
		
		if (rightUp) {
			this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.rightshadow`))
		}

		// this.world.decorate(pos.x, pos.y, this.textureProvider.get(`layer.${height}`));

	}

	decorate(x: number, y: number, texture: Texture) {
		this.decorateLayer.addFrame(texture, x * BRICK_WIDTH, y * BRICK_WIDTH)
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

	getBrickByOffset(offLoc: Vector2) {
		offLoc = offLoc.floor();
		if (offLoc.x >= 32 || offLoc.y >= 32 || offLoc.x < 0 || offLoc.y < 0) return;

		return this.bricks[posToIndex(offLoc.x, offLoc.y)];
	}

	getBrickXY(x: number, y: number) {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x >= 32 || y >= 32 || x < 0 || y < 0) return;

		return this.bricks[posToIndex(x, y)];
	}
}
