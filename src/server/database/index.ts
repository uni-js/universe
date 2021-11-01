import LevelUp, { LevelUp as LevelDB } from 'levelup';
import LevelDown from 'leveldown';

export const PersistDatabaseSymbol = Symbol();

export interface IPersistDatabase {
	set(key: string, value: any): Promise<void>;
	get(key: string): Promise<any>;
}

export function createPersistDatabase(location: string): IPersistDatabase {
	const store = new LevelDown(location);
	const db = LevelUp(store);
	return new LevelDatabase(db);
}

export class LevelDatabase implements IPersistDatabase {
	private store = new Map<any, any>();
	constructor(private db: LevelDB) {}
	/**
	 * 写入一行到LevelDB, value必须是可序列化的对象
	 */
	async set(key: string, value: any): Promise<void> {
		return await this.db.put(key, JSON.stringify(value));
	}

	async get(key: string): Promise<any> {
		try {
			const result = await this.db.get(key);
			return JSON.parse(result.toString());
		} catch (err) {
			return undefined;
		}
	}
}
