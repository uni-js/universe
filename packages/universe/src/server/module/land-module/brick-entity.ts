import { Entity, Index, Property } from '@uni.js/database';
import type { BrickType } from "./spec"

@Index(["landLocX", "landLocY"])
@Entity()
export class Brick {

	@Property()
	brickType: BrickType;

	@Property()
	landLocX: number;

	@Property()
	landLocY: number;

	@Property()
	offLocX: number;

	@Property()
	offLocY: number;

	@Property()
	broken: boolean;
}
