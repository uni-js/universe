import { inject, injectable } from 'inversify';
import { LandLocToLoc, PosToLandPos } from '../../server/land/helper';
import { Vector2 } from '../../server/shared/math';
import { StoreManager } from '../shared/manager';
import { LandObject } from '../object/land';
import { LandStore } from '../shared/store';

@injectable()
export class LandManager extends StoreManager {
	constructor(@inject(LandStore) private landStore: LandStore) {
		super();
	}
	addLand(item: LandObject) {
		this.landStore.add(item);
	}
	removeLand(item: LandObject) {
		this.landStore.remove(item);
	}
	getLandById(id: number) {
		return this.landStore.get(id);
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
	async doTick(tick: number) {}
}
