import { inject, injectable } from 'inversify';
import { LandLocToLoc, PosToLandPos } from '../../server/land/helper';
import { Vector2 } from '../../server/shared/math';
import { GameObjectManager } from '../system/manager';
import { LandObject } from '../object/land';
import { LandStore } from '../store';

@injectable()
export class LandManager extends GameObjectManager<LandObject> {
	constructor(@inject(LandStore) private landStore: LandStore) {
		super(landStore);
	}

	getLandByLoc(landLoc: Vector2) {
		return this.landStore.get(landLoc.x, landLoc.y);
	}

	getBrickByLoc(pos: Vector2) {
		const landLoc = PosToLandPos(pos);
		const startAt = LandLocToLoc(landLoc);

		const land = this.getLandByLoc(landLoc);
		if (!land) return;

		const rawOffLoc = pos.sub(startAt);
		const offLoc = new Vector2(Math.floor(rawOffLoc.x), Math.floor(rawOffLoc.y));
		const brick = land.getBrickByOffset(offLoc);

		return brick;
	}
}
