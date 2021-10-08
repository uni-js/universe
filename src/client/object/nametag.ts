import * as PIXI from 'pixi.js';

export class NameTag extends PIXI.Text {
	private hiddenTicks = 0;

	constructor() {
		super('');
		this.style = new PIXI.TextStyle({
			fill: 'white',
		});
	}

	/**
	 * 使用该方法后，命名栏将会隐藏一段时间
	 */
	setHiddenTicks(ticks: number) {
		this.hiddenTicks = ticks;
	}

	doTick() {
		if (this.hiddenTicks > 0) {
			this.visible = false;
			this.hiddenTicks--;
		}

		if (this.hiddenTicks == 0) {
			this.visible = true;
		}
	}
}
