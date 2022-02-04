import { Vector2 } from '../../shared/math';
import { LAND_WIDTH } from './spec';

export function PosToLandPos(pos: Vector2) {
	const landPos = pos.divFloor(LAND_WIDTH);
	return landPos;
}
export function LandPosToPos(landPos: Vector2) {
	const pos = landPos.mul(LAND_WIDTH);
	return pos;
}
