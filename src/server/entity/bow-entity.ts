import { Actor } from './actor-entity';
import { Entity, Private, Property } from '@uni.js/database';
import { ActorType } from '../types/actor';

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
