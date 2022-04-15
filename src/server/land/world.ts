import { Square2, Vector2 } from '../utils/vector2';
import { Land, LandData, posToLandPos } from './land';
import type { Server } from '../server';
import type { Actor } from '../actor/actor';
import { QueuedWorker } from '../utils/queued-worker';
import { spawn, Worker } from 'threads';
import { IPersistDatabase } from '../database/database';
import { AddLandEvent } from '../event/server';
import { IEventBus } from '@uni.js/server';
import type { Building } from '../building/building';

export class World {
	private lands = new Map<string, Land>();
	private actors = new Map<number, Actor>();
	private buildings = new Map<number, Building>();
	private database: IPersistDatabase;
	private eventBus: IEventBus;
	private queuedLandLoader: QueuedWorker;
	private generatorWorker = spawn(new Worker('./generator'));

	constructor(private server: Server) {
		this.database = this.server.getDatabase();
		this.eventBus = this.server.getEventBus();
		this.queuedLandLoader = new QueuedWorker(this.onLoadLandData.bind(this));
	}

	private async onLoadLandData(landPos: Vector2) {
		let landData = await this.database.get(landPos.toHash('land'));
		if (!landData) {
			landData = await this.generateLand(landPos);
		}

		const land = this.getLand(landPos);
		land.setLoaded();

		this.sendLandData(landPos, landData);
		console.log(`land data loaded: ${landPos.x}:${landPos.y}`);
	}

	getActor(actorId: number) {
		return this.actors.get(actorId);
	}

	addActor(actor: Actor) {
		if (this.actors.has(actor.getId())) {
			return;
		}

		const landPos = actor.getLandPos();
		const land = this.ensureLand(landPos);

		land.addActor(actor);

		this.actors.set(actor.getId(), actor);
		actor.showToAllCansee();
	}

	removeActor(actor: Actor) {
		if (!this.actors.has(actor.getId())) {
			return;
		}

		actor.unattach();

		const landPos = actor.getLandPos();
		const land = this.getLand(landPos);
		if (land) {
			land.removeActor(actor);
		} else {
			console.error(`no actor when remove: ${actor.getId()} at: land=${landPos.x}:${landPos.y}`);
		}

		this.actors.delete(actor.getId());
		actor.unshowToAll();
	}

	addBuilding(building: Building) {
		if (this.buildings.has(building.getId())) {
			return;
		}
		
		const landPos = building.getLandPos();
		const land = this.ensureLand(landPos);
		land.addBuilding(building);
		this.buildings.set(building.getId(), building);
		building.showToAllCansee();
	}

	removeBuilding(building: Building) {
		const landPos = building.getLandPos();
		const land = this.getLand(building.getLandPos());
		if (land) {
			land.removeBuilding(building)
		} else {
			console.error(`no building when remove: ${building.getId()} landPos=${landPos.x}:${landPos.y}`);
		}

		this.buildings.delete(building.getId())
		building.unshowToAll();
	}

	getRadiusActors(center: Vector2, radius: number) {
		const actors: Actor[] = [];
		for(const actor of this.actors.values()) {
			if(actor.getPos().distance(center) <= radius) {
				actors.push(actor);
			}
		}
		return actors;
	}

	getLand(pos: Vector2) {
		return this.lands.get(pos.toHash());
	}

	ensureLand(landPos: Vector2): Land {
		let land = this.getLand(landPos);
		if (land) {
			return land;
		}

		land = new Land(landPos, this.server);
		this.lands.set(landPos.toHash(), land);
		return land;
	}

	requestLandData(landPos: Vector2) {
		if (this.queuedLandLoader.hasTask(landPos)) {
			return;
		}

		this.queuedLandLoader.addTask(landPos);
	}

	private async generateLand(landPos: Vector2) {
		const worker = await this.generatorWorker;
		const landData = await worker.GenerateLandData(landPos.x, landPos.y, 'LAND_SEED');
		this.server.getDatabase().set(landPos.toHash('land'), landData);
		return landData;
	}

	private sendLandData(landPos: Vector2, landData: LandData) {
		const land = this.getLand(landPos);
		if (!land) {
			return;
		}

		const event = new AddLandEvent();
		event.landData = landData;
		event.landX = landPos.x;
		event.landY = landPos.y;

		for (const player of this.server.getPlayers()) {
			if (player.isWatchLand(land)) {
				player.emitEvent(event);
			}
		}
	}

	getAreaNearbyActors(square: Square2) {
		const expand = 3;
		const landFrom = posToLandPos(square.getFrom().addOffset(-expand));
		const landTo = posToLandPos(square.getTo().addOffset(expand));
		const actors: Actor[] = [];

		for(let x = landFrom.x; x <= landTo.x ; x++)
			for(let y = landFrom.y; y <= landTo.y; y++) {
				const land = this.getLand(new Vector2(x, y));
				if(!land) {
					continue;
				}
				for(const actor of land.getActors()) {
					if(actor.getBoundings().isOverlapWith(square)) {
						actors.push(actor);
					}
				}
			}

		return actors;
	}

	getAreaNearbyBuildings(square: Square2) {
		const expand = 3;
		const landFrom = posToLandPos(square.getFrom().addOffset(-expand));
		const landTo = posToLandPos(square.getTo().addOffset(expand));
		const buildings: Building[] = [];

		for(let x = landFrom.x; x <= landTo.x ; x++)
			for(let y = landFrom.y; y <= landTo.y; y++) {
				const land = this.getLand(new Vector2(x, y));
				if(!land) {
					continue;
				}
				for(const building of land.getBuildings()) {
					if(building.getBoundings().isOverlapWith(square)) {
						buildings.push(building);
					}
				}
			}

		return buildings;
	}

	emitToViewers(building: Building, event: any) {
		building.getViewers().forEach((viewer) => {
			this.eventBus.emitTo(viewer.getConnId(), event);
		});
	}

	doTick() {
		for (const actor of this.actors.values()) {
			actor.doTick();
		}
		this.queuedLandLoader.doTick();
	}
}
