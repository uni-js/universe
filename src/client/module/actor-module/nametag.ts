import * as PIXI from 'pixi.js';

export class NameTag extends PIXI.Text {
	/**
	 * if this property is set, the name tag will be hidden for a while
	 */
	public hiddenTicks = 0;

	constructor() {
		super('');
		this.style = new PIXI.TextStyle({
			fill: 'white',
		});
	}

	doFixedUpdateTick() {
		if (this.hiddenTicks > 0) {
			this.visible = false;
			this.hiddenTicks--;
		}

		if (this.hiddenTicks == 0) {
			this.visible = true;
		}
	}
}
