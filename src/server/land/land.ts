import type { Actor } from '../actor/actor';
import type { Vector2 } from '../utils/vector2';
import { Server } from '../server';
import type { Player } from '../player/player';
import { Brick, BrickType } from '../bricks';
import type { World } from './world';
import type { Building } from '../building/building';
import type { EventBusServer } from '@uni.js/server';
import type { Viewable } from '../actor/viewable';

export interface BrickData {
	x: number;
	y: number;
	layers: number[];
}

export interface LandData {
	bricks: BrickData[];
}

export const BRICK_WIDTH = 32;

export function posToLandPos(pos: Vector2) {
	return pos.div(BRICK_WIDTH).floor();
}

export function landPosToPos(landPos: Vector2) {
	return landPos.mul(BRICK_WIDTH).floor();
}

export class Land {
	private loaded = false;
	private actors = new Set<Actor>();
	private bricks = new Map<string, Brick>();
	private buildings = new Map<number, Building>();
	private pos: Vector2;
	private world: World;
	private eventBus: EventBusServer;

	constructor(pos: Vector2, private server: Server) {
		this.pos = pos;
		this.world = this.server.getWorld();
		this.eventBus = this.server.getEventBus();
	}

	isLoaded() {
		return this.loaded;
	}

	setLoaded() {
		this.loaded = true;
	}

	getLandPos() {
		return this.pos;
	}

	getLandPlayers() {
		return this.getActors().filter((item) => item.isPlayer());
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

	addBrickLayer(vec2: Vector2, brickType: BrickType) {
		const hash = vec2.toHash();
		const brick = this.bricks.get(hash);
		if(!brick) {
			console.error(`no brick here: ${hash}`)
			return;
		}
		const layers = brick.getLayers().slice();
		layers.push(brickType);

		const newBrick = new Brick({ layers });
		this.bricks.set(hash, newBrick);
	}

	removeBrickLayer(vec2: Vector2) {
		const hash = vec2.toHash();
		const brick = this.bricks.get(hash);
		if(!brick) {
			console.error(`no brick here: ${hash}`)
			return;
		}
		const layers = brick.getLayers().slice();
		layers.pop();
		
		const newBrick = new Brick({ layers });
		this.bricks.set(hash, newBrick);
	}

	addActor(actor: Actor) {
		this.actors.add(actor);
	}

	removeActor(actor: Actor) {
		this.actors.delete(actor);
	}

    addBuilding(building: Building) {
        this.buildings.set(building.getId(), building);
    }

    removeBuilding(building: Building) {
        this.buildings.delete(building.getId());
    }

	getBuildingById(bId: number) {
		return this.buildings.get(bId);
	}

	getBuildings() {
		return Array.from(this.buildings.values());
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
