import { Arrow, Bow } from '../actor/bow';
import { DroppedItemActor } from '../actor/dropped-item';
import { Player } from '../player/player';
import { ActorType } from '../../server/actor/actor-type';

export class Factory<T> {
	private impls: Map<T, any> = new Map();
	constructor() {}

	addImpl(key: T, impl: any) {
		this.impls.set(key, impl);
		return this;
	}

	private getImpl(key: T) {
		if (!this.impls.has(key)) throw new Error(`can find this implement: ${key}`);

		return this.impls.get(key);
	}

	getNewObject(key: T, ctorArgs: any): any {
		const impl = this.getImpl(key);
		return new impl(...ctorArgs);
	}
}

export class ActorFactory extends Factory<ActorType> {}
export const actorFactory = new ActorFactory();

actorFactory.addImpl(ActorType.PLAYER, Player);
actorFactory.addImpl(ActorType.BOW, Bow);
actorFactory.addImpl(ActorType.ARROW, Arrow);
actorFactory.addImpl(ActorType.DROPPED_ITEM, DroppedItemActor);
