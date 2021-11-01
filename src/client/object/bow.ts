import { Vector2 } from '../../server/shared/math';
import { ActorType } from '../../server/actor/spec';
import { ActorConstructOption, ActorObject } from './actor';
import { TextureProvider } from '../../framework/texture';

export class Arrow extends ActorObject {
	private shootingDirection: number;

	constructor(serverId: number, option: ActorConstructOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.ARROW, texture);

		this.shootingDirection = option.rotation;
		this.anchor = new Vector2(0, 0.5);

		this.updateRotation();
	}

	private updateRotation() {
		this.sprite.rotation = this.shootingDirection;
	}
}

export class Bow extends ActorObject {
	private dragging = false;

	constructor(serverId: number, option: ActorConstructOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.BOW, texture);

		this.canWalk = false;
		this.sprite.animationSpeed = 0.1;
		this.sprite.loop = false;

		this.textures = this.texture.getGroup('actor.bow.{order}', 3);
	}

	startUsing() {
		super.startUsing.call(this);
		this.dragging = true;
		this.playAnimate();
	}

	endUsing() {
		super.endUsing.call(this);
		this.stopAnimate();
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);
	}
}
