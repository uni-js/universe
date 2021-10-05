import React, { useContext } from 'react';
import { Entity, EntityQuery, IMemoryDatabase } from '../../shared/database/memory';
import { UIEventBus } from '../shared/store';
import { TextureProvider } from '../texture';

export type DataSource = IMemoryDatabase;

export type TickingFunction = (...args: any[]) => void;
export interface UITicker {
	add(func: TickingFunction): void;
	remove(func: TickingFunction): void;
}
export interface UIContext {
	/**
	 * UI组件的数据源
	 */
	dataSource: DataSource;

	/**
	 * UI组件的ticker, 与主渲染循环同步
	 */
	ticker: UITicker;

	/**
	 * UI组件可以对外发送事件
	 */
	eventBus: UIEventBus;

	/**
	 * 提供系统内材质的访问
	 */
	textureProvider: TextureProvider;
}
export interface UIEntryProps extends UIContext {
	children?: any[];
}

export const UIContext: React.Context<UIContext> = React.createContext(null);
export function UIEntry(props: UIEntryProps) {
	const contextValue = {
		dataSource: props.dataSource,
		ticker: props.ticker,
		eventBus: props.eventBus,
		textureProvider: props.textureProvider,
	};

	return <UIContext.Provider value={contextValue}>{props.children}</UIContext.Provider>;
}
export function useDataSource() {
	return useContext(UIContext).dataSource;
}
export function useEventBus() {
	return useContext(UIContext).eventBus;
}
export function useTextureProvider() {
	return useContext(UIContext).textureProvider;
}

export function useCollection<E extends Entity>(cls: new () => E): Collection<E> {
	const source = useDataSource();
	return source.getCollection(cls.name);
}

export function useTicker(fn: TickingFunction, deps: any[] = []) {
	const { ticker } = useContext(UIContext);
	React.useEffect(() => {
		ticker.add(fn);
		return () => {
			ticker.remove(fn);
		};
	}, deps);
}

export function useData<E extends Entity>(cls: new () => E, query: EntityQuery<E> = {}) {
	const [state, setState] = React.useState<E>();
	const versionRef = React.useRef(null);

	const source = useCollection(cls);

	useTicker(() => {
		const found = source.findOne(query);
		if (found && found.meta.revision !== versionRef.current) {
			versionRef.current = found.meta.revision;
			setState({ ...found });
		}
	});

	return state;
}

export function useDatas<E extends Entity>(cls: new () => E, query: EntityQuery<E> = {}) {
	const [state, setState] = React.useState<E[]>([]);
	const beforesRef = React.useRef([]);

	const source = useCollection(cls);

	function checkIfChanged(list: any[]): boolean {
		if (beforesRef.current.length !== list.length) return true;
		for (let i = 0; i < list.length; i++) {
			if (beforesRef.current[i] !== list[i]) {
				return true;
			}
			if (beforesRef.current[i].meta.revision !== list[i].meta.revision) {
				return true;
			}
		}
		return false;
	}

	useTicker(() => {
		const foundList = source.find(query);

		if (checkIfChanged(foundList)) {
			beforesRef.current = foundList;
			setState([...foundList]);
		}
	});

	return state;
}

export function useTexturePath(provider: TextureProvider, key: string) {
	//return `public/texture/${key.replace(/\./g,"/")}`;
	const item = provider.getItem(key);
	return item?.url;
}
