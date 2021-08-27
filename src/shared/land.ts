import { Vector2 } from '../server/shared/math';

export function GetPosHash(pos: Vector2) {
	return `${pos.x},${pos.y}`;
}

export function GetPosByHash(hash: string): Vector2 {
	const xys = hash.split(',').map((x) => parseInt(x));
	return new Vector2(xys[0], xys[1]);
}
