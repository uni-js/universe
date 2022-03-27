import { ObjectStore } from '@uni.js/client';
import { LandObject } from '../objects/land-object';
import { injectable } from 'inversify';

import { ActorObject } from '../objects/actor-object';

@injectable()
export class ActorStore extends ObjectStore<ActorObject> {
	hash(item: ActorObject) {
		return [item.getServerId()];
	}
}

@injectable()
export class LandStore extends ObjectStore<LandObject> {
	hash(item: LandObject) {
		return [[item.getServerId()], [item.x, item.y]];
	}
}
