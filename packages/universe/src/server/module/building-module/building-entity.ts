import { Entity, Property } from '@uni.js/database';

@Entity()
export class Building {
	@Property()
	landPosX: number;

	@Property()
	landPosY: number;

	@Property()
	fromX: number;

	@Property()
	fromY: number;

	@Property()
	toX: number;

	@Property()
	toY: number;

	@Property()
	bitmap: number[];
}
