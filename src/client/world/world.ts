import { EventBusClient, ObjectStore } from '@uni.js/client';
import { Texture } from 'pixi.js';
import { AddLandEvent, RemoveLandEvent } from '../../server/event/server';
import { Vector2 } from '../../server/utils/vector2';
import type { GameClientApp } from '../client-app';
import { LandObject } from '../land/land';

export class World {
	private eventBus: EventBusClient;
	private landStore: ObjectStore<LandObject>;
	constructor(private app: GameClientApp) {
		this.eventBus = this.app.eventBus;
		this.eventBus.on(AddLandEvent, this.onAddLandEvent.bind(this));
		this.eventBus.on(RemoveLandEvent, this.onRemoveLandEvent.bind(this));
		this.landStore = new ObjectStore((land) => land.getLandPos().toArray());
		this.app.viewport.addChild(this.landStore.container);
	}

	getApp() {
		return this.app;
	}

	getBrickXY(x: number, y: number) {
		const vec2 = new Vector2(x, y);
		const landPos = vec2.div(32).floor();
		const offset = vec2.sub(landPos.mul(32));

		return this.landStore.get(...landPos.toArray())?.getBrickByOffset(offset);
	}

	decorate(x: number, y: number, texture: Texture) {
		const vec2 = new Vector2(x, y);
		const landPos = vec2.div(32).floor();
		const offset = vec2.sub(landPos.mul(32));

		return this.landStore.get(...landPos.toArray())?.decorate(offset.x, offset.y, texture);
	}

	private onAddLandEvent(event: AddLandEvent) {
		console.log('add a new land:', `${event.landX}:${event.landY}`, event);

		const land = new LandObject(this, this.app.textureProvider, event.landData, 0, new Vector2(event.landX, event.landY));
		this.landStore.add(land);
		land.initLand();
	}

	private onRemoveLandEvent(event: RemoveLandEvent) {
		const land = this.landStore.get(event.landX, event.landY);
		if (!land) {
			console.error("try to remove a land that didn't exist.");
			return;
		}
		this.landStore.remove(land);

		console.log('remove land:', `${event.landX}:${event.landY}`, event);
	}

}
