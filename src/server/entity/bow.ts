import { Actor, ActorType } from '../actor/spec';
import { CtorOption } from '../shared/entity';

export class Bow extends Actor {
	type = ActorType.BOW;

	@CtorOption()
	sizeX = 0.65;

	@CtorOption()
	sizeY = 0.65;
}

export class Arrow extends Actor {
	type = ActorType.ARROW;

	@CtorOption()
	sizeX = 2;

	@CtorOption()
	sizeY = 0.2;

	@CtorOption()
	anchorX = 0;

	@CtorOption()
	anchorY = 0.5;

	/**
	 * 发射者
	 */
	shooter: number;

	/**
	 * 正在发射的方向
	 */
	@CtorOption()
	shootingDirection = 0;

	aliveTick = 0;
}
