import React, { useContext } from 'react';
import { Entity, IMemoryDatabase } from '../../shared/database/memory';
import { UIEventBus } from '../shared/store';

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
	};

	return <UIContext.Provider value={contextValue}>{props.children}</UIContext.Provider>;
}
export function useDataSource() {
	return useContext(UIContext).dataSource;
}
export function useEventBus() {
	return useContext(UIContext).eventBus;
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
