import { CAN_INJECT_COLLECTION, Entity, NotLimitCollection } from './memory-database';
import { GameEventEmitter, AddEntityEvent, RemoveEntityEvent } from '../event';

export type ClassOf<T> = { new (...args: any[]): T };
export type ObjectQueryCondition<T> = Partial<T & LokiObj> & Record<string, any>;

export class ServerSideManager extends GameEventEmitter {
	constructor() {
		super();
	}

	doTick(tick: number): void {}
}

export interface UpdateOnlyCollection<T extends Record<string, any>> extends NotLimitCollection<T> {
	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	remove(): any;

	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	removeWhere(): any;

	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	findAndRemove(): any;

	/**
	 * @deprecated use addEntity method of a entity manager to add an entity
	 */
	add(): any;

	/**
	 * @deprecated use addEntity method of a entity manager to add an entity
	 */
	insert(): any;

	/**
	 * @deprecated use addEntity method of a entity manager to add an entity
	 */
	insertOne(): any;
}

export interface IEntityManager<K> extends ServerSideManager {
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
 * entity manager is designed for managing one type of entity
 */
export class EntityManager<T extends Entity> extends ServerSideManager implements IEntityManager<T> {
	static [CAN_INJECT_COLLECTION] = true;

	private entityList: NotLimitCollection<T>;

	/**
	 * @param updateOnlyEntityList the entity set which is managed
	 */
	constructor(updateOnlyEntityList: UpdateOnlyCollection<T>) {
		super();

		this.entityList = updateOnlyEntityList;
	}

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
		this.emitEvent(AddEntityEvent, { entityId: insertedEntity.$loki, entity: insertedEntity });
		return insertedEntity;
	}

	removeEntity(entity: T) {
		const entityId = entity.$loki;
		this.entityList.remove(entity);
		this.emitEvent(RemoveEntityEvent, { entityId: entityId, entity });
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

export class ExtendedEntityManager<T extends Entity, K extends T> extends ServerSideManager implements IEntityManager<K> {
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
			this.emitEvent(AddEntityEvent, { entityId: newEntity.$loki, entity: newEntity });
		}
		return inserted;
	}

	removeEntity(entity: K): void {
		const entityId = entity.$loki;
		this.manager.removeEntity(entity);

		if (entity instanceof this.clazz) {
			this.emitEvent(RemoveEntityEvent, { entityId, entity });
		}
	}

	getEntityList(): NotLimitCollection<T> {
		return this.manager.getEntityList();
	}
}
