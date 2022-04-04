import { ActorObject } from './actor';
import { TextureProvider } from '@uni.js/texture';
import { ActorType } from '../../server/actor/actor-type';
import { Vector2 } from '../../server/utils/vector2';
import type { GameClientApp } from '../client-app';

export class Arrow extends ActorObject {
	private shootingDirection: number;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);

		this.shootingDirection = attrs.rotation;
		this.anchor = new Vector2(0, 0.5);

		this.updateRotation();
	}

	getType(): ActorType {
		return ActorType.ARROW;
	}

	private updateRotation() {
		this.sprite.rotation = this.shootingDirection;
	}
}

export class Bow extends ActorObject {
	private dragging = false;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);

		this.canWalk = false;
		this.hasShadow = false;

		this.sprite.animationSpeed = 0.1;
		this.sprite.loop = false;

		this.textures = this.getDefaultTextureGroup();
	}

	getType(): ActorType {
		return ActorType.BOW;
	}

	startBeUsing() {
		this.dragging = true;
		this.playAnimate();
	}

	endBeUsing() {
		this.stopAnimate();
	}

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick.call(this, tick);
	}
}
