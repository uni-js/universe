export interface FactoryItemImpl<T> {
	new (...args: any[]): T;
}

export interface IFactory<IT, T> {
	getImpl(type: IT): FactoryItemImpl<T> | undefined;
	getImplOrFail(type: IT): FactoryItemImpl<T>;
	setImpl(type: IT, impl: FactoryItemImpl<T>): void;
	getObject(type: IT, ...args: any[]): T;
}

export class Factory<IT extends string, T> implements IFactory<IT, T> {
	private implMap = new Map<string, FactoryItemImpl<T>>();

	getImpl(type: IT): FactoryItemImpl<T> | undefined {
		return this.implMap.get(type);
	}
	getImplOrFail(type: IT) {
		const impl = this.getImpl(type);
		if (!impl) throw new Error(`类型 ${type} 无法在工厂中找到`);
		return impl;
	}
	setImpl(type: IT, impl: FactoryItemImpl<T>): void {
		this.implMap.set(type, impl);
	}
	getObject(type: IT, ...args: any[]) {
		const Impl = this.getImplOrFail(type);
		return new Impl(...args);
	}
}
