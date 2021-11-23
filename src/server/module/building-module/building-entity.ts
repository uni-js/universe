import { Entity } from '../../../framework/server-side/memory-database';

export class Building extends Entity {
	landPosX: number;
	landPosY: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}
