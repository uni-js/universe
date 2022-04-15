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
	layers: BrickType[];
}

export class Brick{
	private layers: BrickType[];
	constructor(private brickData: BrickData) {
		this.layers = brickData.layers;
	}

	getLayers() {
		return this.layers;
	}



}