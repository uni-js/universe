import { inject, injectable } from 'inversify';
import { LandPosToPos, PosToLandPos } from '../../server/utils/land-pos';
import { Vector2 } from '../../server/utils/math';
import { GameObjectManager } from '@uni.js/client';
import { LandObject } from '../objects/land-object';
import { LandStore } from '../store';

@injectable()
export class LandMgr extends GameObjectManager<LandObject> {
	constructor(@inject(LandStore) private landStore: LandStore) {
		super(landStore);
	}

	getLandByLoc(landPos: Vector2) {
		return this.landStore.get(landPos.x, landPos.y);
	}

	getBrickByLoc(pos: Vector2) {
		const landPos = PosToLandPos(pos);
		const startAt = LandPosToPos(landPos);

		const land = this.getLandByLoc(landPos);
		if (!land) return;

		const rawOffLoc = pos.sub(startAt);
		const offLoc = new Vector2(Math.floor(rawOffLoc.x), Math.floor(rawOffLoc.y));
		const brick = land.getBrickByOffset(offLoc);

		return brick;
	}
}
