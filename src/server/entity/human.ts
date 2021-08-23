import { Vector2 } from '../shared/math';
import { Actor, ActorType } from '../shared/entity';

export class Human extends Actor {
	static ENTITY_TYPE = 'Human';

	constructor(pos: Vector2) {
		super(pos, ActorType.HUMAN);
	}
}
