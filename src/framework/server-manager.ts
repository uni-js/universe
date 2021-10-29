import { Entity, NotLimitCollection } from './memory-database';
import { GameEventEmitter } from './event';
import * as Events from '../server/event/internal';

export type ClassOf<T> = { new (...args: any[]): T };
export type ObjectQueryCondition<T> = Partial<T & LokiObj> & Record<string, any>;

export interface IManager {
	doTick(tick: number): void;
}

export class Manager extends GameEventEmitter implements IManager {
	constructor() {
		super();
	}

	doTick(tick: number): void {}
}

export interface UpdateOnlyCollection<T extends Record<string, any>> extends NotLimitCollection<T> {
	/**
	 * @deprecated 请使用实体管理器的 removeEntity 方法删除实体
	 */
	remove(): any;

	/**
	 * @deprecated 请使用实体管理器的 removeEntity 方法删除实体
	 */
	removeWhere(): any;

	/**
	 * @deprecated 请使用实体管理器的 removeEntity 方法删除实体
	 */
	findAndRemove(): any;

	/**
	 * @deprecated 请使用实体管理器的 addEntity 方法添加实体
	 */
	add(): any;

	/**
	 * @deprecated 请使用实体管理器的 addEntity 方法添加实体
	 */
	insert(): any;

	/**
	 * @deprecated 请使用实体管理器的 addEntity 方法添加实体
	 */
	insertOne(): any;
}

export interface IEntityManager<K> extends Manager {
	getEntityById(entityId: number): K;
	findEntity(query: ObjectQueryCondition<K>): K;
	findEntities(query?: ObjectQueryCondition<K>): K[];
	getAllEntities(): K[];
	hasEntity(query?: ObjectQueryCondition<K>): boolean;
	addNewEntity(newEntity: K): K;
	addNewEntities(newEntities: K[]): K[];
	removeEntity(entity: K): void;
	addAtRecord<R>(entity: K, propertyName: string, record: R): void;
	removeAtRecord<R>(entity: K, propertyName: string, record: R): void;
	hasAtRecord<R>(entity: K, propertyName: string, record: R): boolean;
}

/**
 * 实体管理器是专门用于管理某一种实体的管理器
 *
 * 所有实体管理器共同构成实体管理层
 */
export class EntityManager<T extends Entity> extends Manager implements IEntityManager<T> {
	static canInjectCollection = true;

	private entityList: NotLimitCollection<T>;

	/**
	 * @param updateOnlyEntityList 被管理的实体的集合, 必须是一个 UpdateOnly 的集合
	 */
	constructor(updateOnlyEntityList: UpdateOnlyCollection<T>) {
		super();

		this.entityList = updateOnlyEntityList;
	}

	/**
	 * 直接获取实体列表进行修改可能造成数据不一致
	 */
	getEntityList(): NotLimitCollection<T> {
		return this.entityList;
	}

	addNewEntities(newEntities: T[]): T[] {
		return newEntities.map((newEntity) => {
			return this.addNewEntity(newEntity);
		});
	}

	getEntityById(entityId: number): Readonly<T> {
		return this.entityList.findOne({
			$loki: {
				$eq: entityId,
			},
		});
	}

	findEntity(query: ObjectQueryCondition<T>): Readonly<T> {
		return this.entityList.findOne(query);
	}

	findEntities(query?: ObjectQueryCondition<T>): Readonly<T>[] {
		return this.entityList.find(query) as T[];
	}

	getAllEntities(): Readonly<T>[] {
		return this.entityList.find();
	}

	hasEntity(query?: ObjectQueryCondition<T>) {
		return Boolean(this.findEntity(query));
	}

	addNewEntity(newEntity: T): Readonly<T> {
		const insertedEntity = this.entityList.insertOne(newEntity);
		this.emitEvent(Events.AddEntityEvent, { entityId: insertedEntity.$loki, entity: insertedEntity });
		return insertedEntity;
	}

	removeEntity(entity: T) {
		const entityId = entity.$loki;
		this.entityList.remove(entity);
		this.emitEvent(Events.RemoveEntityEvent, { entityId: entityId, entity });
	}

	addAtRecord<R>(entity: T, propertyName: string, record: R, key?: string) {
		const recordStore = (entity as any)[propertyName] as any;
		if (recordStore.has(record)) return;

		if (key) {
			recordStore.add(key, record);
		} else {
			recordStore.add(record);
		}
	}

	removeAtRecord<R>(entity: T, propertyName: string, recordOrKey: R | string) {
		const recordStore = (entity as any)[propertyName] as any;
		if (!recordStore.has(recordOrKey)) return;
		recordStore.remove(recordOrKey);
	}

	hasAtRecord<R>(entity: T, propertyName: string, recordOrKey: R | string) {
		const recordStore = (entity as any)[propertyName] as any;
		return recordStore.has(recordOrKey);
	}
}

export class ExtendedEntityManager<T extends Entity, K extends T> extends Manager implements IEntityManager<K> {
	constructor(private manager: EntityManager<T>, private clazz: ClassOf<K>) {
		super();
	}

	addNewEntities(newEntities: K[]): K[] {
		return this.manager.addNewEntities(newEntities) as K[];
	}

	addAtRecord<R>(entity: T, propertyName: string, record: R): void {
		this.manager.addAtRecord(entity, propertyName, record);
	}
	removeAtRecord<R>(entity: T, propertyName: string, record: R): void {
		this.manager.removeAtRecord(entity, propertyName, record);
	}
	hasAtRecord<R>(entity: T, propertyName: string, record: R): boolean {
		return this.manager.hasAtRecord(entity, propertyName, record);
	}
	getEntityById(entityId: number): Readonly<K> {
		return this.manager.getEntityById(entityId) as K;
	}
	protected updateEntity<M extends K | T>(entity: M): Readonly<M> {
		const list = this.manager.getEntityList();
		return list.update(entity) as M;
	}
	findEntity(query: ObjectQueryCondition<K>): Readonly<K> {
		return this.manager.findEntity(query) as K;
	}
	findEntities(query?: ObjectQueryCondition<K>): Readonly<K>[] {
		return this.manager.findEntities(query) as K[];
	}
	getAllEntities(): Readonly<K>[] {
		return this.manager.getAllEntities() as K[];
	}
	hasEntity(query?: ObjectQueryCondition<K>): boolean {
		return this.manager.hasEntity(query);
	}
	addNewEntity(newEntity: K): Readonly<K> {
		const inserted = this.manager.addNewEntity(newEntity) as K;

		if (inserted instanceof this.clazz) {
			this.emitEvent(Events.AddEntityEvent, { entityId: newEntity.$loki, entity: newEntity });
		}
		return inserted;
	}
	removeEntity(entity: K): void {
		const entityId = entity.$loki;
		this.manager.removeEntity(entity);

		if (entity instanceof this.clazz) {
			this.emitEvent(Events.RemoveEntityEvent, { entityId, entity });
		}
	}

	/**
	 * 直接获取实体列表进行修改可能造成数据不一致
	 */
	getEntityList(): NotLimitCollection<T> {
		return this.manager.getEntityList();
	}
}
