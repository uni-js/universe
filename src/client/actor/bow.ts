import { ActorObject } from './actor';
import { ActorType } from '../../server/actor/actor-type';
import { Vector2 } from '../../server/utils/vector2';
import type { GameClientApp } from '../client-app';
import { DirectionType } from '../../server/actor/actor';

export class Arrow extends ActorObject {
	getType(): ActorType {
		return ActorType.ARROW;
	}
}

export class Bow extends ActorObject {
	private dragging = false;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);

		this.hasShadow = false;

		this.sprite.animationSpeed = 0.1;
		this.sprite.loop = false;

	}

	getType(): ActorType {
		return ActorType.BOW;
	}

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick.call(this, tick);

		const attaching = this.getAttachingActor();
		if (attaching) {
			this.zIndex = attaching.zIndex + (attaching.direction === DirectionType.BACK ? -0.1 : 0.1);
		}
	}
}
