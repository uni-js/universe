import { Actor } from '../actor-module/actor-entity';
import { ActorType } from '../actor-module/spec';
import { Entity, Private, Property } from '@uni.js/database';

@Entity()
export class Bow extends Actor {
	@Property()
	@Private()
	type = ActorType.BOW;

	@Property()
	sizeX = 0.65;

	@Property()
	sizeY = 0.65;

	@Property()
	@Private()
	obstacleHinder = false;

	@Property()
	@Private()
	boundings: number[] = undefined;
}

export class Arrow extends Actor {
	@Property()
	@Private()
	type = ActorType.ARROW;

	@Property()
	sizeX = 2;

	@Property()
	sizeY = 0.2;

	@Property()
	anchorX = 0;

	@Property()
	anchorY = 0.5;

	@Property()
	@Private()
	obstacleHinder = false;

	@Property()
	@Private()
	boundings: number[] = undefined;

	@Property()
	power = 0.5;

	@Property()
	@Private()
	shooter: number;

	@Property()
	@Private()
	aliveTick = 0;
}
