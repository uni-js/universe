import { Entity } from '@uni.js/server';

export class Building extends Entity {
	landPosX: number;
	landPosY: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}
