import type { Actor } from '../actor/actor';
import { Vector2 } from '../utils/vector2';
import { Server } from '../server';
import type { Player } from '../player/player';
import { Brick, BrickData, BrickType } from '../bricks';
import type { World } from './world';
import { Building, BuildingData } from '../building/building';
import type { EventBusServer } from '@uni.js/server';
import type { Viewable } from '../actor/viewable';
import { AddLandEvent } from '../event/server';
import { RawLandData } from './generator';
import { buildingFactory } from '../../factory/server-factory';

export const BRICK_WIDTH = 32;

export function posToLandPos(pos: Vector2) {
	return pos.div(BRICK_WIDTH).floor();
}

export function landPosToPos(landPos: Vector2) {
	return landPos.mul(BRICK_WIDTH).floor();
}

export interface LandData{
	bricks: BrickData[],
	buildings: BuildingData[]
}

export interface BricksData {
	bricks: BrickData[]
}

export class Land {
	private loaded = false;
	private actors = new Set<Actor>();
	private bricks = new Map<string, Brick>();
	private buildings = new Map<string, Building>();
	private landpos: Vector2;
	private world: World;
	private pos: Vector2;
	private eventBus: EventBusServer;

	constructor(landpos: Vector2, private server: Server) {
		this.landpos = landpos;
		this.pos = landPosToPos(landpos);
		
		this.world = this.server.getWorld();
		this.eventBus = this.server.getEventBus();
	}

	isLoaded() {
		return this.loaded;
	}

	setLoaded(landData: RawLandData) {
		if (this.loaded) {
			return;
		}
		this.loaded = true;

		for(const brick of landData.bricks) {
			const pos = new Vector2(brick.x, brick.y);
			this.bricks.set(pos.toHash(), new Brick(pos, brick.layers, brick.metas));
		}

		for(const building of landData.buildings) {
			const pos = this.pos.add(new Vector2(building.x, building.y));
			this.buildings.set(pos.toHash(), buildingFactory.getNewObject(building.type, this.server, pos, building.meta));
		}		
	}

	getPos() {
		return this.pos;
	}

	getLandPos() {
		return this.landpos;
	}

	getLandPlayers() {
		return this.getActors().filter((item) => item.isPlayer());
	}

	getLandData() {
		const landData: LandData = {
			bricks: [],
			buildings: []
		};
		for(const brick of this.bricks.values()) {
			landData.bricks.push(brick.getBrickData());
		}

		for(const building of this.buildings.values()) {
			landData.buildings.push(building.getBuildingData());
		}
		return landData;
	}

	getActors() {
		return Array.from(this.actors.values());
	}

	getPlayers(): Player[] {
		return this.getActors().filter((actor) => actor.isPlayer()) as Player[];
	}

	getBrick(vec2: Vector2) {
		return this.bricks.get(vec2.toHash());
	}

	addActor(actor: Actor) {
		this.actors.add(actor);
	}

	removeActor(actor: Actor) {
		this.actors.delete(actor);
	}

    addBuilding(building: Building) {
        this.buildings.set(building.getHash(), building);
    }

    removeBuilding(building: Building) {
        this.buildings.delete(building.getHash());
    }

	getBuildings() {
		return Array.from(this.buildings.values());
	}

	syncLandData() {
		const bricksData: BricksData = {
			bricks: this.getLandData().bricks
		}

		const event = new AddLandEvent();
		event.bricksData = bricksData;
		event.landX = this.landpos.x;
		event.landY = this.landpos.y;

		for (const player of this.server.getPlayers()) {
			if (player.isWatchLand(this)) {
				player.emitEvent(event);
			}
		}

		for(const building of this.buildings.values()) {
			building.showToAllCansee();
		}

		for(const actor of this.actors.values()) {
			actor.showToAllCansee();
		}

	}

	getViewables() {
		const viewables: Viewable[] = [...this.getBuildings(), ...this.getActors()];
		return viewables;
	}
	
	getServer() {
		return this.server;
	}

	getWorld() {
		return this.world;
	}
}
