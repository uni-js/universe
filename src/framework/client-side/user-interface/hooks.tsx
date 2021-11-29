import React, { useContext, useEffect } from 'react';

import { TextureProvider } from '../texture';
import { injectable } from 'inversify';
import { EventEmitter2 } from 'eventemitter2';
import { UIStateContainer, UIStateWithMetaInfo } from './state';

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
	 * data source
	 */
	dataSource: DataSource;

	/**
	 * the ticker of ui component, sync to the main rendering loop
	 */
	ticker: UITicker;

	/**
	 * ui component can emit out event through event bus
	 */
	eventBus: UIEventBus;

	/**
	 * provider ability to access texture
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

export function useUIState<E>(cls: new () => E): UIStateWithMetaInfo<E> {
	const [state, setState] = React.useState<UIStateWithMetaInfo<E>>();
	const versionRef = React.useRef(null);
	const uiState = useDataSource().getState(cls);

	useTicker(() => {
		if (uiState && uiState.meta.revision !== versionRef.current) {
			versionRef.current = uiState.meta.revision;
			setState({ ...uiState, meta: uiState.meta });
		}
	});

	return state || { ...uiState, meta: uiState.meta };
}

export function useTexturePath(provider: TextureProvider, key: string) {
	const item = provider.getItem(key);
	return item?.url;
}
