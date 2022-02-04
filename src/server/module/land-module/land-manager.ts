import { Logger } from '@uni.js/utils';
import { Land } from './land-entity';
import { EntityManager, UpdateOnlyCollection, injectCollection, NotLimitCollection, EntityBaseEvent } from '@uni.js/database';
import { Vector2 } from '../../shared/math';
import { PersistDatabaseSymbol, IPersistDatabase } from '../../database';
import { spawn } from 'threads';

import { BrickData, LandData } from './spec';
import { inject, injectable } from 'inversify';
import { Brick } from './brick-entity';

export function BuildLandHash(pos: Vector2) {
	return `land.${pos.x}.${pos.y}`;
}

export interface LandManagerEvents extends EntityBaseEvent {
	LandLoadedEvent: {
		landPosX: number;
		landPosY: number;
	};
	LandDataToPlayerEvent: {
		playerId: number;
		landId: number;
		landPosX: number;
		landPosY: number;
		landData: any;
	};
	LandUnloadedEvent: {
		landId: number;
	};
}

@injectable()
export class LandManager extends EntityManager<Land, LandManagerEvents> {
	private generatorWorker = spawn(new Worker('./generator.worker'));

	constructor(
		@injectCollection(Land) private landList: UpdateOnlyCollection<Land>,
		@injectCollection(Brick) private brickList: NotLimitCollection<Brick>,
		@inject(PersistDatabaseSymbol) private pdb: IPersistDatabase,
	) {
		super(landList);
	}

	private removeLandBricks(x: number, y: number) {
		this.brickList.removeWhere({ landPosX: x, landPosY: y });
	}

	private setBricksByLandData(x: number, y: number, landData: LandData) {
		this.brickList.findAndRemove({ landPosX: x, landPosY: y });
		const bricks = [];
		for (const brickData of landData.bricks) {
			const newBrick = new Brick();
			newBrick.offLocX = brickData.offX;
			newBrick.offLocY = brickData.offY;
			newBrick.landPosX = x;
			newBrick.landPosY = y;
			newBrick.layers = brickData.layers;

			bricks.push(newBrick);
		}
		this.brickList.insert(bricks);
	}

	getLandData(x: number, y: number) {
		const landData: LandData = {
			bricks: [],
		};
		const bricks = this.brickList.find({ landPosX: x, landPosY: y });

		for (const brick of bricks) {
			const brickData: BrickData = {
				offX: brick.offLocX,
				offY: brick.offLocY,
				layers: brick.layers,
			};

			landData.bricks.push(brickData);
		}

		return landData;
	}

	sendLandDataToPlayer(playerId: number, landPos: Vector2) {
		const land = this.getLand(landPos);
		const landData = this.getLandData(landPos.x, landPos.y);

		this.emit('LandDataToPlayerEvent', {
			playerId,
			landId: land.id,
			landPosX: land.landPosX,
			landPosY: land.landPosY,
			landData,
		});
	}

	getLand(landPos: Vector2) {
		return this.findEntity({ landPosX: landPos.x, landPosY: landPos.y });
	}

	async generateLand(landPos: Vector2) {
		const hash = BuildLandHash(landPos);
		const worker = await this.generatorWorker;
		const landData = await worker.GenerateLandData(landPos.x, landPos.y, process.env['LAND_SEED']);

		await this.pdb.set(hash, landData);
		return landData;
	}

	isLandLoaded(landPos: Vector2) {
		const land = this.getLand(landPos);
		return land.isLoaded;
	}

	async loadLand(landPos: Vector2) {
		const land = this.landList.findOne({ landPosX: landPos.x, landPosY: landPos.y });
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

		this.emit('LandLoadedEvent', {
			landPosX: landPos.x,
			landPosY: landPos.y,
		});

		Logger.debug(`load land :(${landPos.x}:${landPos.y})`);
	}

	async unloadLand(landPos: Vector2) {
		const land = await this.getLand(landPos);

		if (!land || !land.isLoaded) throw new Error(`unable load land at: ${landPos.x}:${landPos.y}`);

		this.removeLandBricks(landPos.x, landPos.y);

		this.emit('LandUnloadedEvent', {
			landId: land.id,
		});
	}

	getLandByLoc(landPos: Vector2) {
		return this.landList.findOne({ landPosX: landPos.x, landPosY: landPos.y });
	}

	getLandActors(landPos: Vector2): number[] {
		const land = this.getLandByLoc(landPos);
		return land.actors.getAll();
	}

	addNewLand(landPos: Vector2) {
		const newLand = new Land();

		newLand.landPosX = landPos.x;
		newLand.landPosY = landPos.y;
		newLand.isLoaded = false;
		newLand.isLoading = false;

		this.addNewEntity(newLand);
	}

	ensureLand(landPos: Vector2) {
		if (this.hasLand(landPos)) return;

		this.addNewLand(landPos);
	}

	hasLand(landPos: Vector2) {
		return Boolean(this.getLand(landPos));
	}
}
