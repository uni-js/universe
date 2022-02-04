import { Entity, Index, Property } from '@uni.js/database';
import type { BrickType } from './spec';

@Index(['landPosX', 'landPosY'])
@Entity()
export class Brick {
	@Property()
	landPosX: number;

	@Property()
	landPosY: number;

	@Property()
	offLocX: number;

	@Property()
	offLocY: number;

	@Property()
	posX: number;

	@Property()
	posY: number;

	@Property()
	layers: BrickType[] = [];

	@Property()
	broken: boolean;
}
