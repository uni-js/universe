import * as PIXI from 'pixi.js';

export class NameTag extends PIXI.Text {
	/**
	 * 设置该属性后，命名栏将会隐藏一段时间
	 */
	public hiddenTicks = 0;

	constructor() {
		super('');
		this.style = new PIXI.TextStyle({
			fill: 'white',
		});
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
