import { Land } from '../entity/land';
import { Actor } from '../shared/entity';
import { EntityManager } from '../shared/manager';
import { Vector2 } from '../shared/math';
import { PersistDatabaseSymbol, IPersistDatabase } from '../../shared/database/persist';
import { spawn } from 'threads';

import { BrickData, LandData } from '../land/types';
import { inject, injectable } from 'inversify';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { Brick } from '../entity/brick';
import { GameEvent } from '../event';

export function BuildLandHash(pos: Vector2) {
	return `land.${pos.x}.${pos.y}`;
}

@injectable()
export class LandManager extends EntityManager<Land> {
	private generatorWorker = spawn(new Worker('../land/generator.worker'));

	constructor(
		@injectCollection(Land) private landList: ICollection<Land>,
		@injectCollection(Brick) private brickList: ICollection<Brick>,
		@injectCollection(Actor) private actorList: ICollection<Actor>,
		@inject(PersistDatabaseSymbol) private pdb: IPersistDatabase,
	) {
		super(landList);
	}

	private removeLandBricks(x: number, y: number) {
		this.brickList.removeWhere({ landLocX: x, landLocY: y });
	}
	private setBricksByLandData(x: number, y: number, landData: LandData) {
		this.brickList.findAndRemove({ landLocX: x, landLocY: y });
		const bricks = [];
		for (const brickData of landData.bricks) {
			const newBrick = new Brick();
			newBrick.offLocX = brickData.offX;
			newBrick.offLocY = brickData.offY;
			newBrick.landLocX = x;
			newBrick.landLocY = y;
			newBrick.brickType = brickData.type;

			bricks.push(newBrick);
		}
		this.brickList.insert(bricks);
	}

	getLandData(x: number, y: number) {
		const landData: LandData = {
			bricks: [],
		};
		const bricks = this.brickList.find({ landLocX: x, landLocY: y });

		for (const brick of bricks) {
			const brickData: BrickData = {
				offX: brick.offLocX,
				offY: brick.offLocY,
				type: brick.brickType,
			};

			landData.bricks.push(brickData);
		}

		return landData;
	}

	sendLandDataToPlayer(playerId: number, landPos: Vector2) {
		const land = this.getLand(landPos);
		const landData = this.getLandData(landPos.x, landPos.y);

		this.emit(GameEvent.LandDataToPlayer, playerId, land.$loki, land.landLocX, land.landLocY, landData);
	}

	getLand(landPos: Vector2) {
		return this.findEntity({ landLocX: landPos.x, landLocY: landPos.y });
	}

	async generateLand(landLoc: Vector2) {
		const hash = BuildLandHash(landLoc);
		const worker = await this.generatorWorker;
		const landData = await worker.GenerateLandData(landLoc.x, landLoc.y, process.env['LAND_SEED']);

		await this.pdb.set(hash, landData);
		return landData;
	}

	isLandLoaded(landPos: Vector2) {
		const land = this.getLand(landPos);
		return land.isLoaded;
	}

	async loadLand(landLoc: Vector2) {
		const land = this.getLand(landLoc);
		if (land.isLoaded || land.isLoading) return;

		const hash = BuildLandHash(landLoc);
		let landData = await this.pdb.get(hash);

		if (Boolean(landData) == false) {
			landData = await this.generateLand(landLoc);
		}

		land.isLoading = true;
		this.landList.update(land);

		this.setBricksByLandData(landLoc.x, landLoc.y, landData);

		land.isLoaded = true;
		land.isLoading = false;
		this.landList.update(land);

		this.emit(GameEvent.LandLoaded, landLoc);

		console.debug(`加载 Land :(${landLoc.x}:${landLoc.y})`);
	}
	async unloadLand(landLoc: Vector2) {
		const land = await this.getLand(landLoc);

		if (!land || !land.isLoaded) throw new Error(`卸载Land失败 At: ${landLoc.x}:${landLoc.y}`);

		this.removeLandBricks(landLoc.x, landLoc.y);

		this.emit(GameEvent.LandUnloaded, land.$loki);
	}

	getLandByLoc(landPos: Vector2) {
		return this.landList.findOne({ landLocX: landPos.x, landLocY: landPos.y });
	}

	getLandActors(landPos: Vector2): number[] {
		const land = this.getLandByLoc(landPos);
		return land.actors.getAll();
	}

	addNewLand(landPos: Vector2) {
		const newLand = new Land();

		newLand.landLocX = landPos.x;
		newLand.landLocY = landPos.y;
		newLand.isLoaded = false;
		newLand.isLoading = false;

		this.addNewEntity(newLand);
	}

	ensureLand(landPos: Vector2) {
		if (this.hasLand(landPos)) return;

		this.addNewLand(landPos);
	}

	addLandActor(landPos: Vector2, actorId: number) {
		const land = this.getLand(landPos);
		this.addAtRecord(land, 'actors', actorId);
	}

	removeLandActor(landPos: Vector2, actorId: number) {
		const land = this.getLand(landPos);
		this.removeAtRecord(land, 'actors', actorId);
	}

	hasLand(landLoc: Vector2) {
		return Boolean(this.getLand(landLoc));
	}
}
