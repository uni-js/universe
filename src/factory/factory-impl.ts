
export class Factory<T = any> {
	private impls: Map<T, any> = new Map();
	constructor() {}

	addImpl(key: T, impl: any) {
		this.impls.set(key, impl);
		return this;
	}

	private getImpl(key: T) {
		if (!this.impls.has(key)) throw new Error(`can find this implement: ${key}`);

		return this.impls.get(key);
	}

	getNewObject(key: T, ...ctorArgs: any[]): any {
		const impl = this.getImpl(key);
		return new impl(...ctorArgs);
	}
}
