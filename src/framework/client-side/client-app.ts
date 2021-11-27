import 'reflect-metadata';
import * as PIXI from 'pixi.js';

import React from 'react';
import ReactDOM from 'react-dom';

import { ParseTexturePath, TextureProvider, TextureType } from './texture';
import { EventBusClient } from './bus-client';
import { Container, interfaces } from 'inversify';
import { bindToContainer, resolveAllBindings } from '../inversify';
import { UIEntry, UIEventBus } from './user-interface/hooks';

import { UIStateContainer } from './user-interface/state';
import { ClientModuleResolvedResult, ClientSideModule, resolveClientSideModule } from '../module';
import { Logger } from '../local-logger';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;

export interface TextureDef {
	name: string;
	url: string;
}

export interface ClientApplicationOption {
	serverUrl: string;
	playground: HTMLDivElement;
	texturePaths: string[];
	uiEntry: any;
	width: number;
	height: number;
	resolution: number;
	module: ClientSideModule;
}

export function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export class ClientApp {
	private updateTick = 0;
	private fixedTick = 0;

	private app: PIXI.Application;

	private managers: any[] = [];
	private controllers: any[] = [];

	private uiStatesContainer: UIStateContainer;
	private textureProvider = new TextureProvider();

	private busClient: EventBusClient;
	private uiEventBus: UIEventBus;

	private iocContainer: Container;

	private wrapper: HTMLElement;
	private uiContainer: HTMLElement;
	private canvasContainer: HTMLElement;

	private playground: HTMLElement;

	private moduleResolved: ClientModuleResolvedResult;

	constructor(private option: ClientApplicationOption) {
		this.moduleResolved = resolveClientSideModule(option.module);

		this.app = new PIXI.Application({
			width: option.width,
			height: option.height,
			resolution: option.resolution,
		});

		this.playground = option.playground;

		this.iocContainer = new Container({ skipBaseClassChecks: true });
		this.uiStatesContainer = new UIStateContainer(this.moduleResolved.uiStates);

		this.managers = this.moduleResolved.managers;
		this.controllers = this.moduleResolved.controllers;

		this.busClient = new EventBusClient(this.option.serverUrl);
		this.uiEventBus = new UIEventBus();

		this.initProviderBindings();
		this.initWrapper();
		this.initUiContainer();
	}

	getCanvasElement() {
		return this.app.view;
	}

	getCanvasContainer() {
		return this.canvasContainer;
	}

	get<T>(identifier: interfaces.ServiceIdentifier<T>) {
		return this.iocContainer.get(identifier);
	}

	getCanvas() {
		return this.app.view;
	}

	addTicker(fn: any) {
		this.app.ticker.add(fn);
	}

	addDisplayObject(displayObject: PIXI.DisplayObject) {
		this.app.stage.addChild(displayObject);
	}

	removeDisplayObject(displayObject: PIXI.DisplayObject) {
		this.app.stage.removeChild(displayObject);
	}

	removeTicker(fn: any) {
		this.app.ticker.remove(fn);
	}

	async start() {
		await this.initTextures();

		this.initUIBindings();
		this.initBaseBindings();

		resolveAllBindings(this.iocContainer, this.managers);
		resolveAllBindings(this.iocContainer, this.controllers);

		this.app.start();

		this.renderUI();
		this.startLoop();
	}

	private initWrapper() {
		const wrapper = document.createElement('div');
		wrapper.classList.add('uni-wrapper');
		wrapper.style.width = `${this.app.view.width}px`;
		wrapper.style.height = `${this.app.view.height}px`;
		wrapper.style.position = 'relative';

		this.playground.appendChild(wrapper);
		this.wrapper = wrapper;
	}

	private initUiContainer() {
		const uiContainer = document.createElement('div');
		uiContainer.classList.add('uni-ui-container');
		uiContainer.style.position = 'absolute';
		uiContainer.style.left = '0px';
		uiContainer.style.top = '0px';
		uiContainer.style.width = '100%';
		uiContainer.style.height = '100%';
		uiContainer.style.userSelect = 'none';
		uiContainer.style.pointerEvents = 'none';

		const canvasContainer = document.createElement('div');
		canvasContainer.classList.add('uni-canvas-container');
		canvasContainer.append(this.app.view);

		this.wrapper.appendChild(uiContainer);
		this.wrapper.appendChild(canvasContainer);
		this.uiContainer = uiContainer;
		this.canvasContainer = canvasContainer;
	}

	private initProviderBindings() {
		for (const provider of this.moduleResolved.providers) {
			this.iocContainer.bind(provider.key).toConstantValue(provider.value);
		}
	}

	private initBaseBindings() {
		const ioc = this.iocContainer;

		ioc.bind(EventBusClient).toConstantValue(this.busClient);
		ioc.bind(TextureProvider).toConstantValue(this.textureProvider);
		ioc.bind(UIEventBus).toConstantValue(this.uiEventBus);

		bindToContainer(ioc, [...this.managers, ...this.controllers]);
	}

	private initUIBindings() {
		this.iocContainer.bind(UIStateContainer).toConstantValue(this.uiStatesContainer);

		for (const [stateClass, state] of this.uiStatesContainer.getEntries()) {
			this.iocContainer.bind(stateClass).toConstantValue(state);
		}
	}

	private renderUI() {
		const dataSource = this.iocContainer.get(UIStateContainer);

		const ticker = this.app.ticker;
		const eventBus = this.uiEventBus;
		const textureProvider = this.textureProvider;

		ReactDOM.render(
			React.createElement(UIEntry, { dataSource, ticker, eventBus, textureProvider }, React.createElement(this.option.uiEntry)),
			this.uiContainer,
		);
	}

	private doUpdateTick() {
		try {
			for (const manager of this.managers) {
				this.iocContainer.get<any>(manager).doUpdateTick(this.updateTick);
			}
		} catch (err: any) {
			Logger.error(err.stack);
		}

		this.updateTick += 1;
	}

	private doFixedUpdateTick() {
		try {
			for (const manager of this.managers) {
				this.iocContainer.get<any>(manager).doFixedUpdateTick(this.fixedTick);
			}
		} catch (err: any) {
			Logger.error(err.stack);
		}

		this.fixedTick += 1;
	}

	private startLoop() {
		this.app.ticker.add(this.doUpdateTick.bind(this));
		this.app.ticker.add(this.doFixedUpdateTick.bind(this));
	}

	private async initTextures() {
		for (const path of this.option.texturePaths) {
			const parsed = ParseTexturePath(path);
			if (Boolean(parsed) === false) continue;
			const [key, relPath, type] = parsed;
			if (type == TextureType.IMAGESET) {
				await this.textureProvider.addJSON(key, relPath);
			} else {
				await this.textureProvider.add(key, relPath);
			}
		}
	}
}
