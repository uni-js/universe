import { Vector2 } from './math';

export class Range2 {
	constructor(public readonly from: Vector2, public readonly to: Vector2) {}

	getWidth() {
		return this.to.x - this.from.x;
	}

	getHeight() {
		return this.to.y - this.from.y;
	}
}
