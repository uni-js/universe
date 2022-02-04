export const LAND_WIDTH = 16;

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

export interface BrickData {
	offX: number;
	offY: number;

	layers: BrickType[];
}

export enum LandEvent {
	LandLoaded = 'LandLoaded',
	LandUnloaded = 'LandUnloaded',
}

export interface LandData {
	bricks: BrickData[];
}
