import { ActorType } from '../../shared/actor';
import { Actor, CtorOption } from '../shared/entity';

export class Bow extends Actor {
	type = ActorType.BOW;
}

export class Arrow extends Actor {
	type = ActorType.ARROW;

	/**
	 * 正在发射的方向
	 */
	@CtorOption()
	shootingDirection = 0;
}
