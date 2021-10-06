import { Vector2 } from '../../server/shared/math';
import { ActorType } from '../../server/actor/spec';
import { ActorCtorOption, ActorObject } from '../shared/actor';
import { TextureProvider } from '../texture';

export class Arrow extends ActorObject {
	private shootingDirection: number;

	constructor(serverId: number, option: ActorCtorOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(2, 0.2), ActorType.ARROW, texture);
		this.shootingDirection = option.shootingDirection;

		this.sprite.anchor.set(0, 0.5);
		this.updateRotation();
	}

	private updateRotation() {
		this.sprite.rotation = this.shootingDirection;
	}
}

export class Bow extends ActorObject {
	private dragging = false;

	constructor(serverId: number, option: ActorCtorOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(0.65, 0.65), ActorType.BOW, texture, 3);

		this.setAnimateSpeed(0.1);
		this.sprite.loop = false;
	}

	startUsing() {
		super.startUsing.call(this);
		this.dragging = true;
		this.playAnim();
	}

	endUsing() {
		super.endUsing.call(this);
		this.stopAnim();
	}
	async doTick(tick: number) {
		super.doTick.call(this, tick);
	}
}
