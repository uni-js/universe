import { Brick } from '../../server/entity/brick/brick';
import { LAND_WIDTH } from '../../server/land/const';
import { LandData } from '../../server/land/types';
import { Vector2 } from '../../server/shared/math';
import { IndexedStore, ObjectStore } from '../../shared/store';
import { StaticObject } from '../shared/game-object';
import { TextureManager } from '../texture';
import { BrickObject } from './brick';
import * as PIXI from 'pixi.js';

export function BuildLandObjectIdHash(item: LandObject | string): string {
	if (typeof item == 'string') return `land.id.${item}`;
	else return BuildLandObjectIdHash(item.getObjectId());
}

export function BuildLandObjectLocHash(item: LandObject | Vector2): string {
	if (item instanceof Vector2) return `land.pos.${item.x}#${item.y}`;

	return BuildLandObjectLocHash(item.getLandLoc());
}
export function BuildBrickObjectOffsetHash(item: BrickObject | Vector2): string {
	if (item instanceof BrickObject) {
		const offLoc = item.getOffsetLoc();
		return BuildBrickObjectOffsetHash(offLoc);
	}
	return `brick.offset.${item.x}#${item.y}`;
}

export class LandObject extends StaticObject {
	private brickContainer = new PIXI.Container();
	private bricks;

	constructor(initLandData: LandData, textureManager: TextureManager, objectId: string, private landLoc: Vector2) {
		super(textureManager, objectId, new Vector2(1, 1), landLoc.mul(LAND_WIDTH), landLoc.mul(LAND_WIDTH));
		this.zIndex = 0;
		this.bricks = new ObjectStore<BrickObject>(this.brickContainer, BuildBrickObjectOffsetHash);

		this.addChild(this.brickContainer);

		this.setLandData(initLandData);
	}
	getLandLoc() {
		return this.landLoc;
	}

	setLandData(landData: LandData) {
		for (const [index, brick] of landData.bricks.entries()) {
			const brickLoc = new Vector2(brick.offX, brick.offY);

			const newBrick = new BrickObject(
				brick.type,
				'',
				this.textureManager,
				brickLoc,
				this.landLoc,
				new Vector2(brick.offX, brick.offY),
			);
			this.bricks.add(newBrick);
		}
	}

	getBrickByOffset(offLoc: Vector2) {
		return this.bricks.get(BuildBrickObjectOffsetHash(offLoc));
	}
}
