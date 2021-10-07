import { Container, inject } from 'inversify';
import LokiJS from 'lokijs';

export const MemoryDatabaseSymbol = Symbol();

export interface NotLimitCollection<T extends Record<string, any>> extends LokiJS.Collection<T> {}

export type EntityQuery<T> = LokiQuery<T>;

export type IMemoryDatabase = LokiJS;

export class MemoryDatabase extends LokiJS {}

export class Entity {
	$loki?: number;
	meta?: {
		created: number;
		revision: number;
		updated: number;
		version: number;
	};
}
export interface EntityImpl {
	new (): Entity;
	name: string;
}

export function createMemoryDatabase(entities: EntityImpl[]): IMemoryDatabase {
	const db = new LokiJS('memory');
	for (const entity of entities) {
		db.addCollection(entity.name);
	}
	return db;
}
export function injectCollection(cls: any) {
	const decorate = inject(cls);
	return (target: any, targetKey: string, index?: number) => {
		if (!target.canInjectCollection) throw new Error(`类 ${target.name} 无法注入集合, 只有实体管理器可以注入集合并改变数据`);

		decorate(target, targetKey, index);
	};
}

export function bindCollectionsTo(ioc: Container, entities: EntityImpl[], db: IMemoryDatabase) {
	for (const cls of entities) {
		ioc.bind(cls).toConstantValue(db.getCollection(cls.name));
	}
}
