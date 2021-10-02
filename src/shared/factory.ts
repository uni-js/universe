export type Impl<T, C extends any[]> = { new (...args: C): T };

export type FactoryMapper<K extends string | number | symbol, T, C extends any[]> = Record<K, Impl<T, C>>;

export class Factory<K extends string | number | symbol, T, C extends any[]> {
	private impls: Map<K, Impl<T, C>> = new Map();
	constructor() {}

	addImpls(mapper: FactoryMapper<K, T, C>) {
		for (const key in mapper) {
			this.addImpl(key, mapper[key]);
		}
	}

	addImpl(key: K, impl: Impl<T, C>) {
		this.impls.set(key, impl);
	}

	private getImpl(key: K) {
		if (!this.impls.has(key)) throw new Error(`can find this implement: ${key}`);

		return this.impls.get(key) as Impl<T, C>;
	}

	getNewObject(key: K, ctorArgs: C): T {
		const impl = this.getImpl(key);
		return new impl(...ctorArgs);
	}
}
