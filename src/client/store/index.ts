import { ObjectStore } from '@uni.js/client';
import { LandObject } from '../module/land-module/land-object';
import { injectable } from 'inversify';

import { ActorObject } from '../module/actor-module/actor-object';

@injectable()
export class ActorLayer extends ObjectStore<ActorObject> {
	hash(item: ActorObject) {
		return [item.getServerId()];
	}
}

@injectable()
export class LandLayer extends ObjectStore<LandObject> {
	hash(item: LandObject) {
		return [[item.getServerId()], [item.x, item.y]];
	}
}

export class BuildingCreatorLayer extends ObjectStore<any> {
	hash(item: any): any[] {
		return [];
	}
}
