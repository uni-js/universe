import { Actor, ActorType } from '../actor-module/spec';
import { ConstructOption } from '../../shared/entity';

export class Bow extends Actor {
	type = ActorType.BOW;

	@ConstructOption()
	sizeX = 0.65;

	@ConstructOption()
	sizeY = 0.65;

	obstacleHinder = false;

	boundings: number[] = undefined;
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

	obstacleHinder = false;

	boundings: number[] = undefined;

	@ConstructOption()
	power = 0.5;

	shooter: number;

	aliveTick = 0;
}
