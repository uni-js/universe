import { Entity, ICollection } from '../../shared/database/memory';
import { GameEvent } from '../event';
import { EventEmitter } from '../shared/event';

export type ObjectQueryCondition<T> = Partial<T & LokiObj> & Record<string, any>;

export interface IManager {
	doTick(tick: number): void;
}

export class Manager extends EventEmitter implements IManager {
	doTick(tick: number): void {}
}

export class ExtendedEntityManager<T extends Entity, K extends T> extends Manager {
	constructor(private entityList: ICollection<T>) {
		super();
	}

	getEntityById(entityId: number): K {
		return this.entityList.findOne({
			$loki: {
				$eq: entityId,
			},
		}) as K;
	}

	findEntity(query: ObjectQueryCondition<K>) {
		return this.entityList.findOne(query) as K;
	}

	findEntities(query?: ObjectQueryCondition<K>): K[] {
		return this.entityList.find(query) as K[];
	}

	getAllEntities(): K[] {
		return this.entityList.find() as K[];
	}

	hasEntity(query?: ObjectQueryCondition<K>) {
		return Boolean(this.findEntity(query));
	}

	addNewEntity(newEntity: K): K {
		const insertedEntity = this.entityList.insertOne(newEntity);
		this.emit(GameEvent.AddEntityEvent, insertedEntity.$loki, insertedEntity);
		return insertedEntity as K;
	}

	removeEntity(entity: K) {
		const entityId = entity.$loki;
		this.entityList.remove(entity);
		this.emit(GameEvent.RemoveEntityEvent, entityId, entity);
	}
}

export class EntityManager<T extends Entity> extends ExtendedEntityManager<T, T> {}
