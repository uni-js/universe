import { HashedStore } from '../../shared/store';
import { LandObject } from '../object/land';
import { inject, injectable } from 'inversify';

import * as PIXI from 'pixi.js';
import { Entity, MemoryDatabase } from '../../shared/database/memory';
import { EventEmitter } from '../../server/shared/event';
import { ActorObject } from './actor';

@injectable()
export class ActorContainer extends PIXI.Container {}

@injectable()
export class LandContainer extends PIXI.Container {}

@injectable()
export class ActorStore extends HashedStore<ActorObject> {
	constructor(@inject(ActorContainer) actorContainer: ActorContainer) {
		super(actorContainer);
	}
	hash(item: ActorObject) {
		return [item.getServerId()];
	}
}

@injectable()
export class LandStore extends HashedStore<LandObject> {
	constructor(@inject(LandContainer) landContainer: LandContainer) {
		super(landContainer);
	}
	hash(item: LandObject) {
		return [[item.getServerId()], [item.x, item.y]];
	}
}

@injectable()
export class DataStore extends MemoryDatabase {}

@injectable()
export class UIEventBus extends EventEmitter {}

export class PlayerInfo extends Entity {
	/**
	 * 玩家名
	 */
	playerName: string;

	/**
	 * 玩家角色id
	 */
	actorId: number;
}

export class PlayerInventoryInfo extends Entity {
	/**
	 * 当前背包指向的格子坐标
	 */
	currentIndexAt = 0;
}

export const DataStoreEntities = [PlayerInfo, PlayerInventoryInfo];
