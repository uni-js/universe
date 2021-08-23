import * as PIXI from 'pixi.js';
import { GetPureColorTexture } from '../shared/pure-color';

export class ParticleObject extends PIXI.ParticleContainer {
	private texture;
	constructor(color_name: string, size: number, private count: number, areaWidth: number, areaHeight: number) {
		super(64, {
			vertices: true,
			position: true,
			rotation: true,
			uvs: true,
			tint: true,
			alpha: true,
			scale: true,
		});
		this.width = areaWidth;
		this.height = areaHeight;
		this.texture = GetPureColorTexture(color_name, size);
		this.initObjects();
	}
	private initObjects() {
		for (let i = 0; i < this.count; i++) {
			const sprite = PIXI.Sprite.from(this.texture);
			sprite.width = this.width;
			sprite.height = this.height;

			const x = Math.random() * this.width;
			const y = Math.random() * this.height;
			sprite.position.set(x, y);
			this.addChild(sprite);
		}
	}
}
