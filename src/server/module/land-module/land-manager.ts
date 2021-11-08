import { Land } from './land-entity';
import { EntityManager, UpdateOnlyCollection } from '../../../framework/server-side/server-manager';
import { Vector2 } from '../../shared/math';
import { PersistDatabaseSymbol, IPersistDatabase } from '../../database';
import { spawn } from 'threads';

import { BrickData, LandData } from './types';
import { inject, injectable } from 'inversify';
import { NotLimitCollection, injectCollection } from '../../../framework/server-side/memory-database';
import { Brick } from './brick-entity';

import * as Events from '../../event/internal';

export function BuildLandHash(pos: Vector2) {
	return `land.${pos.x}.${pos.y}`;
}

@injectable()
export class LandManager extends EntityManager<Land> {
	private generatorWorker = spawn(new Worker('./generator.worker'));

	constructor(
		@injectCollection(Land) private landList: UpdateOnlyCollection<Land>,
		@injectCollection(Brick) private brickList: NotLimitCollection<Brick>,
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

		this.emitEvent(Events.LandDataToPlayerEvent, {
			playerId,
			landId: land.$loki,
			landPosX: land.landLocX,
			landPosY: land.landLocY,
			landData,
		});
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

	async loadLand(landPos: Vector2) {
		const land = this.landList.findOne({ landLocX: landPos.x, landLocY: landPos.y });
		if (land.isLoaded || land.isLoading) return;

		const hash = BuildLandHash(landPos);
		let landData = await this.pdb.get(hash);

		if (Boolean(landData) == false) {
			landData = await this.generateLand(landPos);
		}

		land.isLoading = true;
		this.landList.update(land);

		this.setBricksByLandData(landPos.x, landPos.y, landData);

		land.isLoaded = true;
		land.isLoading = false;
		this.landList.update(land);

		this.emitEvent(Events.LandLoadedEvent, {
			landPosX: landPos.x,
			landPosY: landPos.y,
		});

		console.debug(`加载 Land :(${landPos.x}:${landPos.y})`);
	}

	async unloadLand(landPos: Vector2) {
		const land = await this.getLand(landPos);

		if (!land || !land.isLoaded) throw new Error(`卸载Land失败 At: ${landPos.x}:${landPos.y}`);

		this.removeLandBricks(landPos.x, landPos.y);

		this.emitEvent(Events.LandUnloadedEvent, {
			landId: land.$loki,
		});
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

	hasLand(landLoc: Vector2) {
		return Boolean(this.getLand(landLoc));
	}
}
