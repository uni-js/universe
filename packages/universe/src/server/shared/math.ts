import RandomBytes from 'randombytes';
import SAT from 'sat';
import { CurveInterpolator2D } from 'curve-interpolator';

export const BILLION_VALUE = Math.pow(10, 9);

export class Vector2 {
	constructor(public x: number, public y: number) {}

	divFloor(ratio: number) {
		return new Vector2(Math.floor(this.x / ratio), Math.floor(this.y / ratio));
	}

	mul(ratio: number) {
		return new Vector2(this.x * ratio, this.y * ratio);
	}

	equals(vec: Vector2) {
		return this.x == vec.x && this.y == vec.y;
	}

	clone() {
		return new Vector2(this.x, this.y);
	}

	add(delta: Vector2) {
		return new Vector2(this.x + delta.x, this.y + delta.y);
	}

	sub(delta: Vector2) {
		return new Vector2(this.x - delta.x, this.y - delta.y);
	}

	subAbs(vec: Vector2) {
		const delta = this.sub(vec);
		return new Vector2(Math.abs(delta.x), Math.abs(delta.y));
	}

	getRad() {
		const acos = Math.acos(this.getCosine());
		const rad = this.y > 0 ? acos : 2 * Math.PI - acos;
		return rad;
	}

	getCosine() {
		const r = Math.sqrt(this.x * this.x + this.y * this.y);
		return this.x / r;
	}

	distanceTo(vec: Vector2) {
		return vec.sub(this).getSqrt();
	}

	getSqrt() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	rotate(rad: number) {
		return new Vector2(this.x * Math.cos(rad) - this.y * Math.sin(rad), this.x * Math.sin(rad) + this.y * Math.cos(rad));
	}

	toSATVector() {
		return new SAT.Vector(this.x, this.y);
	}

	static getVectorDelta(v1: Vector2, v2: Vector2): Vector2 {
		return new Vector2(v2.x - v1.x, v2.y - v1.y);
	}

	static getVector2ByDistance(distance: number, rad: number) {
		return new Vector2(Math.cos(rad), Math.sin(rad)).mul(distance);
	}

	static fromArray(array: [number, number]) {
		return new Vector2(array[0], array[1]);
	}

	static fromSATVector(satVec: SAT.Vector) {
		return new Vector2(satVec.x, satVec.y);
	}
}

export function Interpolate2d(points: Vector2[], x: number) {
	const interpolator = new CurveInterpolator2D(points.map((point) => [point.x, point.y]));
	const point = interpolator.getPointAt(x);

	return new Vector2(point[0], point[1]);
}

export function GetUniqueId() {
	return RandomBytes(8).toString('hex');
}

export function Divide2DVector(vec: Vector2, xwidth: number, ywidth: number) {
	const x = Math.floor(vec.x / xwidth);
	const y = Math.floor(vec.y / ywidth);

	return new Vector2(x, y);
}
