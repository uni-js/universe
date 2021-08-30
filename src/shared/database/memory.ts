import { Container, inject } from 'inversify';
import LokiJS from 'lokijs';

export const MemoryDatabaseSymbol = Symbol();

export type ICollection<T extends Record<string, any>> = LokiJS.Collection<T>;

export type IMemoryDatabase = LokiJS;

export class MemoryDatabase extends LokiJS {}

export class Entity {
	$loki: number;
	meta: Record<string, any> = {};
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
	return inject(cls);
}

export function bindCollectionsTo(ioc: Container, entities: EntityImpl[], db: IMemoryDatabase) {
	for (const cls of entities) {
		ioc.bind(cls).toConstantValue(db.getCollection(cls.name));
	}
}
