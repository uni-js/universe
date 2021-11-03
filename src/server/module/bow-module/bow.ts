import { Actor, ActorType } from '../actor-module/spec';
import { ConstructOption } from '../../shared/entity';

export class Bow extends Actor {
	type = ActorType.BOW;

	@ConstructOption()
	sizeX = 0.65;

	@ConstructOption()
	sizeY = 0.65;
}

export class Arrow extends Actor {
	type = ActorType.ARROW;

	@ConstructOption()
	sizeX = 2;

	@ConstructOption()
	sizeY = 0.2;

	@ConstructOption()
	anchorX = 0;

	@ConstructOption()
	anchorY = 0.5;

	bounding = [1.9, -0.1, 2.1, 0.1];

	/**
	 * 力度
	 */
	@ConstructOption()
	power = 0.5;

	/**
	 * 发射者
	 */
	shooter: number;

	aliveTick = 0;
}
