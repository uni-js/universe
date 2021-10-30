import { ObjectStore } from '../../framework/object-store';
import { LandObject } from '../object/land';
import { injectable } from 'inversify';

import { Entity, MemoryDatabase } from '../../framework/memory-database';
import { ActorObject } from '../object/actor';
import { ContainerType } from '../../server/inventory';
import { ItemType } from '../../server/item';

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

@injectable()
export class DataStore extends MemoryDatabase {}

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

export class ShortcutContainerInfo extends Entity {
	/**
	 * 已经更新过至少一次
	 */
	firstUpdated = false;
	/**
	 * 快捷栏的容器id
	 */
	containerId: number;

	/**
	 * 当前背包指向的格子坐标
	 */
	currentIndexAt = 0;
}

/**
 * 背包中的一个格子
 */
export class InventoryBlockInfo extends Entity {
	/**
	 * 来自于容器
	 */
	containerType: ContainerType;

	/**
	 * 格子在背包中的坐标
	 */
	index: number;

	/**
	 * 物品类型
	 */
	itemType: ItemType;

	/**
	 * 物品存储数量
	 */
	itemCount = 0;
}

export class BowUsingInfo extends Entity {
	isUsing = false;
	/**
	 * 力度, 从 0 到 1
	 */
	power = 0;

	/**
	 * 弓是否已经可以释放了
	 */
	canRelease = false;
}

export const DataStoreEntities = [PlayerInfo, ShortcutContainerInfo, InventoryBlockInfo, BowUsingInfo];
