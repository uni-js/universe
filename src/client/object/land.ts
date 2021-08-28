import { LAND_WIDTH } from '../../server/land/const';
import { LandData } from '../../server/land/types';
import { Vector2 } from '../../server/shared/math';
import { HashedStore } from '../../shared/store';
import { StaticObject } from '../shared/game-object';
import { TextureManager } from '../texture';
import { BrickObject } from './brick';
import * as PIXI from 'pixi.js';

export class LandObject extends StaticObject {
	private brickContainer = new PIXI.Container();
	private bricks;

	constructor(initLandData: LandData, textureManager: TextureManager, objectId: number, private landLoc: Vector2) {
		super(textureManager, objectId, new Vector2(1, 1), landLoc.mul(LAND_WIDTH), landLoc.mul(LAND_WIDTH));
		this.zIndex = 0;
		this.bricks = new HashedStore<BrickObject>(this.brickContainer, (item) => [item.x, item.y]);

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
				-1,
				this.textureManager,
				brickLoc,
				this.landLoc,
				new Vector2(brick.offX, brick.offY),
			);
			this.bricks.add(newBrick);
		}
	}

	getBrickByOffset(offLoc: Vector2) {
		return this.bricks.get(offLoc.x, offLoc.y);
	}
}
