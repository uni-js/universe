import { Vector2 } from './math';
import { LAND_WIDTH } from '../types/land';

export function PosToLandPos(pos: Vector2) {
	const landPos = pos.divFloor(LAND_WIDTH);
	return landPos;
}

export function LandPosToPos(landPos: Vector2) {
	const pos = landPos.mul(LAND_WIDTH);
	return pos;
}

export function GetPosHash(pos: Vector2) {
	return `${pos.x},${pos.y}`;
}

export function GetPosByHash(hash: string): Vector2 {
	const xys = hash.split(',').map((x) => parseInt(x));
	return new Vector2(xys[0], xys[1]);
}
