import { PosToLandPos } from '../utils/land-pos';
import { Vector2 } from '../utils/math';
import { Entity, Index, Property } from '@uni.js/database';
import { RecordSet } from '../utils/tools';

/**
 * calculated and get all land position of specified radius
 *
 * @returns land position array
 */
export function GetRadiusLands(pos: Vector2, radius: number): Vector2[] {
	const landPos = PosToLandPos(pos);
	const landPoss: Vector2[] = [];

	for (let dx = -radius; dx <= radius; dx++)
		for (let dy = -radius; dy <= radius; dy++) {
			if (dx == 0 && dy == 0) continue;

			landPoss.push(landPos.add(new Vector2(dx, dy)));
		}

	landPoss.push(landPos);

	return landPoss;
}

@Index(['landPosX', 'landPosY'])
@Entity()
export class Land {
	@Property()
	landPosX: number;

	@Property()
	landPosY: number;

	@Property()
	isLoaded = false;

	@Property()
	isLoading = false;

	@Property()
	actors: RecordSet<number> = new RecordSet();
}
