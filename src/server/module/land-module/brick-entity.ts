import { Entity } from '../../../framework/server-side/memory-database';

export enum BrickType {
	ROCK = 'rock',

	GRASS = 'grass',

	DRY_DIRT = 'drydr',

	DIRT = 'dirt',

	WET_DIRT = 'wetdr',

	WATER = 'water',

	ICE = 'ice',

	SAND = 'sand',
}

export class Brick extends Entity {
	brickType?: BrickType;
	landLocX?: number;
	landLocY?: number;
	offLocX?: number;
	offLocY?: number;
	broken?: boolean;
}
