import { Actor, DirectionType } from './actor';
import { Vector2 } from '../utils/vector2';
import { ActorType } from './actor-type';

export const Direction2Rotation = {
	[DirectionType.FORWARD]: Math.PI / 2,
	[DirectionType.LEFT]: Math.PI,
	[DirectionType.BACK]: (3 * Math.PI) / 2,
	[DirectionType.RIGHT]: 0,
};

export class Bow extends Actor {
	getType(): number {
		return ActorType.BOW;
	}

	getSize() {
		return new Vector2(0.65, 0.65);
	}

	endUsing(): void {
		super.endUsing();
		if (this.useTicks > 20) {
		}
	}

	doTick(): void {
		super.doTick();
		if (this.attaching !== undefined) {
			const attaching = this.getAttachingActor();
			if (attaching) {
				this.rotation = Direction2Rotation[attaching.getDirection()];
			}
		}
	}
}
