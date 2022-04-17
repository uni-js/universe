export enum BrickType {
	DIRT,
	DRY_DIRT,
	ICE,
	SAND,
	WATER,
	ROCK,
	GRASS,
	WET_DIRT,
}

export interface BrickData {
	x: number;
	y: number;
	layers: BrickType[];
	metas: number[];
}

export class Brick{
	private layers: BrickType[];
	private metas: BrickType[];
	constructor(private brickData: BrickData) {
		this.layers = brickData.layers;
		this.metas = brickData.metas;
	}

	getLayers() {
		return this.layers;
	}

	getMetas() {
		return this.metas;
	}
}