import { injectable } from 'inversify';
import * as PIXI from 'pixi.js';

export interface IViewport {
	moveCenter(x: number, y: number): void;
	getWorldPointAt(screenX: number, screenY: number): [number, number];
	getWorldWidth(): number;
	getWorldHeight(): number;
}

@injectable()
export class Viewport extends PIXI.Container implements IViewport {
	constructor(private screenWidth: number, private screenHeight: number, private worldWidth: number, private worldHeight: number) {
		super();

		this.moveCenter(0, 0);
	}

	moveCenter(x: number, y: number) {
		this.position.set(this.worldWidth / 2 - x, this.worldHeight / 2 - y);
	}

	getWorldPointAt(screenX: number, screenY: number): [number, number] {
		const ratioW = this.worldWidth / this.screenWidth;
		const ratioH = this.worldHeight / this.screenHeight;

		return [screenX * ratioW - this.position.x, screenY * ratioH - this.position.y];
	}

	getWorldWidth() {
		return this.worldWidth;
	}

	getWorldHeight() {
		return this.worldHeight;
	}
}
