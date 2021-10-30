import { ObjectStore } from '../../framework/object-store';
import { LandObject } from '../object/land';
import { injectable } from 'inversify';

import { ActorObject } from '../object/actor';

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
