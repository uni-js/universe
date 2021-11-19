import { PosToLandPos } from './helper';
import { Vector2 } from '../../shared/math';
import { Entity } from '../../../framework/server-side/memory-database';
import { RecordSet } from '../../utils';

/**
 * calculated and get all land position of specified radius
 *
 * @returns land position array
 */
export function GetRadiusLands(pos: Vector2, radius: number): Vector2[] {
	const landLoc = PosToLandPos(pos);
	const landLocs: Vector2[] = [];

	for (let dx = -radius; dx <= radius; dx++)
		for (let dy = -radius; dy <= radius; dy++) {
			if (dx == 0 && dy == 0) continue;

			landLocs.push(landLoc.add(new Vector2(dx, dy)));
		}

	landLocs.push(landLoc);

	return landLocs;
}

export class Land extends Entity {
	landLocX: number;
	landLocY: number;
	isLoaded = false;
	isLoading = false;
	actors: RecordSet<number> = new RecordSet();
}
