import { Entity, ICollection } from '../../shared/database/memory';
import { GameEvent } from '../event';
import { EventEmitter } from '../shared/event';
import { RecordSet } from '../utils';

export type ObjectQueryCondition<T> = Partial<T & LokiObj> & Record<string, any>;

export interface IManager {
	doTick(tick: number): void;
}

export class Manager extends EventEmitter implements IManager {
	doTick(tick: number): void {}
}

export interface IEntityManager<T, K> extends Manager {
	getEntityById(entityId: number): K;
	updateEntity(entity: K): K;
	findEntity(query: ObjectQueryCondition<K>): K;
	findEntities(query?: ObjectQueryCondition<K>): K[];
	getAllEntities(): K[];
	hasEntity(query?: ObjectQueryCondition<K>): boolean;
	addNewEntity(newEntity: K): K;
	removeEntity(entity: K): void;
	getEntityList(): ICollection<T>;
	addAtRecord<R>(entity: K, propertyName: string, record: R): void;
	removeAtRecord<R>(entity: K, propertyName: string, record: R): void;
	hasAtRecord<R>(entity: K, propertyName: string, record: R): boolean;
}

export class EntityManager<T extends Entity> extends Manager implements IEntityManager<T, T> {
	constructor(private entityList: ICollection<T>) {
		super();
	}

	protected handleRecordAdded<R>(entity: T, propertyName: string, record: R): void {}
	protected handleRecordRemoved<R>(entity: T, propertyName: string, record: R): void {}

	getEntityList(): ICollection<T> {
		return this.entityList;
	}

	getEntityById(entityId: number): T {
		return this.entityList.findOne({
			$loki: {
				$eq: entityId,
			},
		});
	}

	updateEntity(entity: T): T {
		return this.entityList.update(entity);
	}

	findEntity(query: ObjectQueryCondition<T>) {
		return this.entityList.findOne(query);
	}

	findEntities(query?: ObjectQueryCondition<T>): T[] {
		return this.entityList.find(query) as T[];
	}

	getAllEntities(): T[] {
		return this.entityList.find();
	}

	hasEntity(query?: ObjectQueryCondition<T>) {
		return Boolean(this.findEntity(query));
	}

	addNewEntity(newEntity: T): T {
		const insertedEntity = this.entityList.insertOne(newEntity);
		this.emit(GameEvent.AddEntityEvent, insertedEntity.$loki, insertedEntity);
		return insertedEntity;
	}

	removeEntity(entity: T) {
		const entityId = entity.$loki;
		this.entityList.remove(entity);
		this.emit(GameEvent.RemoveEntityEvent, entityId, entity);
	}

	addAtRecord<R>(entity: T, propertyName: string, record: R) {
		const recordSet = (entity as any)[propertyName] as RecordSet<R>;
		if (recordSet.has(record)) return;

		recordSet.add(record);

		this.handleRecordAdded(entity, propertyName, record);
	}

	removeAtRecord<R>(entity: T, propertyName: string, record: R) {
		const recordSet = (entity as any)[propertyName] as RecordSet<R>;
		if (!recordSet.has(record)) return;

		recordSet.remove(record);

		this.handleRecordRemoved(entity, propertyName, record);
	}

	hasAtRecord<R>(entity: T, propertyName: string, record: R) {
		const recordSet = (entity as any)[propertyName] as RecordSet<R>;
		return recordSet.has(record);
	}
}

export class ExtendedEntityManager<T extends Entity, K extends T> extends Manager implements IEntityManager<T, K> {
	constructor(private manager: EntityManager<T>) {
		super();
		this.manager.onAny((event, ...args) => {
			this.emit(event, ...args);
		});
	}

	protected handleRecordAdded<R>(entity: T, propertyName: string, record: R): void {}

	protected handleRecordRemoved<R>(entity: T, propertyName: string, record: R): void {}

	addAtRecord<R>(entity: T, propertyName: string, record: R): void {
		this.manager.addAtRecord(entity, propertyName, record);
		this.handleRecordAdded(entity, propertyName, record);
	}
	removeAtRecord<R>(entity: T, propertyName: string, record: R): void {
		this.manager.removeAtRecord(entity, propertyName, record);
		this.handleRecordRemoved(entity, propertyName, record);
	}
	hasAtRecord<R>(entity: T, propertyName: string, record: R): boolean {
		return this.manager.hasAtRecord(entity, propertyName, record);
	}
	getEntityById(entityId: number): K {
		return this.manager.getEntityById(entityId) as K;
	}
	updateEntity(entity: K): K {
		return this.manager.updateEntity(entity) as K;
	}
	findEntity(query: ObjectQueryCondition<K>): K {
		return this.manager.findEntity(query) as K;
	}
	findEntities(query?: ObjectQueryCondition<K>): K[] {
		return this.manager.findEntities(query) as K[];
	}
	getAllEntities(): K[] {
		return this.manager.getAllEntities() as K[];
	}
	hasEntity(query?: ObjectQueryCondition<K>): boolean {
		return this.manager.hasEntity(query);
	}
	addNewEntity(newEntity: K): K {
		return this.manager.addNewEntity(newEntity) as K;
	}
	removeEntity(entity: K): void {
		return this.manager.removeEntity(entity);
	}
	getEntityList(): ICollection<T> {
		return this.manager.getEntityList();
	}
}
