import SAT from "sat";

export class Vector2 {
	constructor(public x: number, public y: number) {}

	length() {
		return Math.hypot(this.x, this.y);
	}

	swap() {
		return new Vector2(this.y, this.x);
	}

	add(vec2: Vector2) {
		return new Vector2(this.x + vec2.x, this.y + vec2.y);
	}

	addOffset(val: number) {
		return new Vector2(this.x + val, this.y + val);
	}

	normalize() {
		const len = this.length();
		return new Vector2(this.x / len, this.y / len);
	}

	sub(vec2: Vector2, abs = false) {
		if (abs) {
			return new Vector2(Math.abs(this.x - vec2.x), Math.abs(this.y - vec2.y));
		} else {
			return new Vector2(this.x - vec2.x, this.y - vec2.y);
		}
	}

	equal(vec2: Vector2) {
		if (!vec2) {
			return false;
		}
		return this.x === vec2.x && this.y === vec2.y;
	}

	distance(vec2: Vector2) {
		return Math.hypot(vec2.x - this.x, vec2.y - this.y);
	}

	mul(times: number) {
		return new Vector2(this.x * times, this.y * times);
	}

	div(times: number) {
		return new Vector2(this.x / times, this.y / times);
	}

	floor() {
		return new Vector2(Math.floor(this.x), Math.floor(this.y));
	}

	floorMid() {
		return new Vector2(Math.floor(this.x) + 0.5, Math.floor(this.y) + 0.5);
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

	clone() {
		return new Vector2(this.x, this.y);
	}

	toHash(prefix = '') {
		return `${prefix}:${this.x}:${this.y}`;
	}

	toJSON() {
		return { x: this.x, y: this.y };
	}

	toArray() {
		return [this.x, this.y];
	}

	toSATVector() {
		return new SAT.Vector(this.x, this.y);
	}

	static fromArray(array: number[]) {
		return new Vector2(array[0], array[1]);
	}
}


export class Square2{
	private fromX: number;
	private fromY: number;
	private toX: number;
	private toY: number;
	private satBox: SAT.Box;

	constructor(from: Vector2, to: Vector2) {
		this.fromX = Math.min(from.x, to.x); 
		this.fromY = Math.min(from.y, to.y);
		this.toX = Math.max(from.x, to.x)
		this.toY = Math.max(from.y, to.y);

		const leftTopPoint = new Vector2(this.fromX, this.fromY).toSATVector();
		this.satBox = new SAT.Box(leftTopPoint, this.toX - this.fromX, this.toY - this.fromY);
	}

	getFrom() {
		return new Vector2(this.fromX, this.fromY)
	}
	
	getTo() {
		return new Vector2(this.toX, this.toY)
	}

	getSATBox() {
		return this.satBox;	
	}

	toPolygon() {
		return this.satBox.toPolygon();
	}
	
	isOverlapWith(square: Square2) {
		return SAT.testPolygonPolygon(square.toPolygon(), this.toPolygon());
	}
}