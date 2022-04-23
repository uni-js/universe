import { Vector2 } from "../utils/vector2";

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

export interface BrickData{
	x: number;
	y: number;
	layers: BrickType[];
	metas: BrickType[];
}

export class Brick{
	private layers: BrickType[];
	private metas: BrickType[];
	private pos: Vector2;
	constructor(pos: Vector2, layers: BrickType[], metas: number[]) {
		this.layers = layers;
		this.metas = metas;
		this.pos = pos;
	}

	getLayers() {
		return this.layers;
	}

	getMetas() {
		return this.metas;
	}

	getBrickData() {
		return {
			x: this.pos.x,
			y: this.pos.y,
			layers: this.layers,
			metas: this.metas
		}
	}
}