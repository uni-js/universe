import { HashedStore } from '../../shared/store';
import { ActorObject, IGameObject } from '../shared/game-object';
import { LandObject } from '../object/land';
import { inject, injectable } from 'inversify';

import * as PIXI from 'pixi.js';
import { Entity, MemoryDatabase } from '../../shared/database/memory';
import { EventEmitter } from '../../server/shared/event';

@injectable()
export class ObjectContainer extends PIXI.Container {}

@injectable()
export class LandContainer extends PIXI.Container {}

@injectable()
export class ActorStore extends HashedStore<ActorObject> {
	constructor(@inject(LandContainer) landContainer: LandContainer) {
		super(landContainer);
	}
	hash(item: ActorObject) {
		return [[item.getObjectId()], [item.getPosition().x, item.getPosition().y]];
	}
}

@injectable()
export class LandStore extends HashedStore<LandObject> {
	constructor(@inject(LandContainer) landContainer: LandContainer) {
		super(landContainer);
	}
	hash(item: LandObject) {
		return [[item.getObjectId()], [item.x, item.y]];
	}
}

@injectable()
export class DataStore extends MemoryDatabase {}

@injectable()
export class UIEventBus extends EventEmitter {}

export enum GameInfoType {
	PLAYER_INFO,
}
export class GameInfo extends Entity {
	type: GameInfoType;
	/**
	 * 玩家名
	 */
	playerName: string;

	/**
	 * 玩家角色id
	 */
	playerActorId: number;
}

export const DataStoreEntities = [GameInfo];
