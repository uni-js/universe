import * as PIXI from 'pixi.js';
import { Vector2 } from '../../server/shared/math';
import { GameObject } from '../system/game-object';
import { TextureProvider } from '../texture';

export class HealthBar extends GameObject {
	private graph: PIXI.Graphics;
	private size = new Vector2(1, 0.2);
	private healthValue = 100;
	private maxHealth = 100;

	private showTicks = 0;

	constructor(texture: TextureProvider) {
		super(texture);

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
	setHealthMax(maxVal: number) {
		this.maxHealth = maxVal;
		this.updateHealthDrawing();
	}

	setHealthValue(val: number) {
		this.healthValue = val;
		this.updateHealthDrawing();
	}

	/**
	 * 使用该方法后, 血量条会显示一段时间
	 */
	setShowTicks(ticks: number) {
		this.showTicks = ticks;
	}

	async doTick() {
		if (this.showTicks > 0) {
			this.visible = true;
			this.showTicks--;
		}

		if (this.showTicks == 0) {
			this.visible = false;
		}
	}
}
