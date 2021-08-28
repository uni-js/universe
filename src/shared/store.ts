import { EventEmitter } from '../server/shared/event';
import * as PIXI from 'pixi.js';

export class SetStore extends Set {}
export class MapStore<V> extends Map<string, V> {}

export const HASH_SPLIT_CHAR = '#';
export type HashItem = string | number;
export type Hasher<T> = (item: T) => HashItem[] | HashItem[][];

export interface ObjectContainer<T> {
	addChild(item: T): void;
	removeChild(item: T): void;
}

export class HashedStore<T extends PIXI.DisplayObject> {
	private store = new Map<string, T>();
	constructor(private container: ObjectContainer<T>, private initHasher?: Hasher<T>) {}
	add(item: T) {
		const hashes = this.getHashStrings(item);
		if (this.hasHashes(hashes)) return;

		for (const hash of hashes) {
			this.store.set(hash, item);
		}
		this.container.addChild(item);
	}
	remove(item: T) {
		const hashes = this.getHashStrings(item);
		if (this.hasHashes(hashes) === false) return;

		for (const hash of hashes) {
			this.store.delete(hash);
		}
		this.container.removeChild(item);
	}
	get(...hashItems: HashItem[]) {
		const hashStr = this.getSingleHashString(hashItems);
		return this.store.get(hashStr);
	}
	getAll() {
		return Array.from(this.store.values());
	}
	private hasHashes(hashes: string[]) {
		for (const hash of hashes) {
			if (this.store.has(hash)) return true;
		}
		return false;
	}
	private getHashStrings(item: T): string[] {
		const hasher = this.initHasher || this.hash;
		const hashed = hasher(item);
		if (Array.isArray(hashed[0])) {
			return (hashed as HashItem[][]).map((hash) => {
				return this.getSingleHashString(hash);
			});
		} else {
			return [this.getSingleHashString(hashed as HashItem[])];
		}
	}
	private getSingleHashString(hash: HashItem[]) {
		return `${this.getObjectTypeName()}${HASH_SPLIT_CHAR}${hash.join(HASH_SPLIT_CHAR)}`;
	}
	protected getObjectTypeName(): string {
		return this.constructor.name;
	}
	protected hash(item: T): HashItem[] | HashItem[][] {
		return [];
	}

	getContainer() {
		return this.container;
	}
}
