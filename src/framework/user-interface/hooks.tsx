import React, { useContext } from 'react';

import { TextureProvider } from '../texture';
import { injectable } from 'inversify';
import { EventEmitter2 } from 'eventemitter2';
import { UIStateContainer } from './state';

@injectable()
export class UIEventBus extends EventEmitter2 {}

export type DataSource = UIStateContainer;

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

export function useTicker(fn: TickingFunction, deps: any[] = []) {
	const { ticker } = useContext(UIContext);
	React.useEffect(() => {
		ticker.add(fn);
		return () => {
			ticker.remove(fn);
		};
	}, deps);
}

export function useUIState<E>(cls: new () => E) {
	const [state, setState] = React.useState<E>();
	const versionRef = React.useRef(null);

	const uiState = useDataSource().getState(cls);

	useTicker(() => {
		if (uiState && uiState.meta.revision !== versionRef.current) {
			versionRef.current = uiState.meta.revision;
			setState({ ...uiState });
		}
	});

	return state;
}

export function useTexturePath(provider: TextureProvider, key: string) {
	//return `public/texture/${key.replace(/\./g,"/")}`;
	const item = provider.getItem(key);
	return item?.url;
}
