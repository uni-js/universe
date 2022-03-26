import { Brick } from '../entity/brick-entity';
import { EntityManager, injectCollection, EntityCollection, EntityBaseEvent } from '@uni.js/database';
import { BrickType } from '../types/land';

const BRICK_MAX_LAYER = 8;

export interface BrickMgrEvents extends EntityBaseEvent {
	UpdateBrickEvent: {
		posX: number;
		posY: number;
		layers: number[];
		addOrRemove: boolean;
	};
}

export class BrickMgr extends EntityManager<Brick, BrickMgrEvents> {
	constructor(@injectCollection(Brick) private brickList: EntityCollection<Brick>) {
		super(brickList);
	}

	placeLayer(id: number, brickType: BrickType) {
		const brick = this.brickList.findOne({ id });
		if (brick.layers.length >= BRICK_MAX_LAYER) return;

		brick.layers.push(brickType);
		this.notifyBrickUpdated(brick, true);
	}

	removeLayer(id: number) {
		const brick = this.brickList.findOne({ id });
		brick.layers.pop();

		this.notifyBrickUpdated(brick, false);
	}

	private notifyBrickUpdated(brick: Brick, addOrRemove: boolean) {
		this.emit('UpdateBrickEvent', {
			posX: brick.posX,
			posY: brick.posY,
			layers: brick.layers,
			addOrRemove,
		});
	}
}
