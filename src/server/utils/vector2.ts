export class Vector2{
    constructor(public x: number, public y: number) {

    }

    add(vec2: Vector2) {
        return new Vector2(this.x + vec2.x, this.y + vec2.y);
    }

    sub(vec2: Vector2, abs = false) {
        if (abs) {
            return new Vector2(Math.abs(this.x - vec2.x), Math.abs(this.y - vec2.y));
        } else {
            return new Vector2(this.x - vec2.x, this.y - vec2.y);
        }
    }

    equal(vec2: Vector2) {
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
        return {x: this.x, y: this.y};
    }

    static fromArray(array: number[]) {
        return new Vector2(array[0], array[1]);
    }
    
}