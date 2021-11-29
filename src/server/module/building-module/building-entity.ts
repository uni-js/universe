import { Entity } from '../../../framework/server-side/memory-database';

export const BUILDING_BITMAP_PER_BRICK = 2;

export class Building extends Entity {
	landPosX: number;
	landPosY: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}
