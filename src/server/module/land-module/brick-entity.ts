import { Entity } from '../../../framework/server-side/memory-database';

export enum BrickType {
	ROCK,
	GRASS,
	DRY_DIRT,
	DIRT,
	WET_DIRT,
	WATER,
	ICE,
	SAND,
}

export enum BrickTypeName {
	'rock',
	'grass',
	'drydr',
	'dirt',
	'wetdr',
	'water',
	'ice',
	'sand',
}

export class Brick extends Entity {
	brickType: BrickType;
	landLocX: number;
	landLocY: number;
	offLocX: number;
	offLocY: number;
	broken: boolean;
}
