import { Vector2 } from '../../shared/math';
import { LAND_WIDTH } from './spec';

export function PosToLandPos(pos: Vector2) {
	const landLoc = pos.divFloor(LAND_WIDTH);
	return landLoc;
}
export function LandLocToLoc(landLoc: Vector2) {
	const pos = landLoc.mul(LAND_WIDTH);
	return pos;
}
