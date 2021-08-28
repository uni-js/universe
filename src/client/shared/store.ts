import { MapStore, HashedStore } from '../../shared/store';
import { ActorObject, IGameObject } from '../shared/game-object';
import { LandObject } from '../object/land';
import { inject, injectable } from 'inversify';

import * as PIXI from 'pixi.js';

@injectable()
export class ObjectContainer extends PIXI.Container {}

@injectable()
export class BrickContainer extends PIXI.Container {}

@injectable()
export class ActorContainer extends PIXI.Container {}

@injectable()
export class UiContainer extends PIXI.Container {}

@injectable()
export class ActorStore extends HashedStore<ActorObject> {
	constructor(@inject(ActorContainer) actorContainer: ActorContainer) {
		super(actorContainer);
	}
	hash(item: ActorObject) {
		return [item.getObjectId()];
	}
}

@injectable()
export class UiStore extends HashedStore<IGameObject> {
	constructor(@inject(UiContainer) uiContainer: UiContainer) {
		super(uiContainer);
	}
	hash(item: IGameObject) {
		return [item.constructor.name];
	}
}

@injectable()
export class LandStore extends HashedStore<LandObject> {
	constructor(@inject(ActorContainer) actorContainer: ActorContainer) {
		super(actorContainer);
	}
	hash(item: LandObject) {
		return [[item.getObjectId()], [item.x, item.y]];
	}
}

@injectable()
export class DataStore extends MapStore<any> {}
