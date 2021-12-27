import * as PIXI from 'pixi.js';
import { Vector2 } from '../../../server/shared/math';
import { GameObject } from '@uni.js/client';
import { TextureProvider } from '@uni.js/texture';

export class HealthBar extends GameObject {
	/**
	 * if this property is set, the health bar will appear for a while
	 */
	public showTicks = 0;

	private _healthValue = 100;
	private _maxHealth = 100;

	private graph: PIXI.Graphics;
	private size = new Vector2(1, 0.2);

	constructor(textureProvider: TextureProvider) {
		super(textureProvider);

		this.graph = new PIXI.Graphics();
		this.graph.width = this.size.x;
		this.graph.height = this.size.y;

		this.graph.x = -this.size.x / 2;
		this.graph.y = -this.size.y / 2;

		this.visible = false;
		this.updateHealthDrawing();
		this.addChild(this.graph);
	}

	private updateHealthDrawing() {
		const percent = this.healthValue / this.maxHealth;

		const posX = percent * this.size.x;
		this.graph.clear();
		this.graph.beginFill(0xff0000, 0.8);
		this.graph.drawRect(0, 0, posX, this.size.y);
		this.graph.endFill();

		this.graph.beginFill(0xcccccc, 0.5);
		this.graph.drawRect(posX, 0, this.size.x - posX, this.size.y);
		this.graph.endFill();
	}

	get maxHealth() {
		return this._maxHealth;
	}

	set maxHealth(maxVal: number) {
		this._maxHealth = maxVal;
		this.updateHealthDrawing();
	}

	get healthValue() {
		return this._healthValue;
	}

	set healthValue(val: number) {
		this._healthValue = val;
		this.updateHealthDrawing();
	}

	doFixedUpdateTick() {
		if (this.showTicks > 0) {
			this.visible = true;
			this.showTicks--;
		}

		if (this.showTicks == 0) {
			this.visible = false;
		}
	}
}
