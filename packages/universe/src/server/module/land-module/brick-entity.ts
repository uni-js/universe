import { Entity } from '@uni.js/server';
import type { BrickType } from "./spec"

export class Brick extends Entity {
	brickType: BrickType;
	landLocX: number;
	landLocY: number;
	offLocX: number;
	offLocY: number;
	broken: boolean;
}
