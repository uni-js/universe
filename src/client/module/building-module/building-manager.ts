import { inject, injectable } from 'inversify';
import { ClientSideManager } from '../../../framework/client-side/client-manager';
import { Vector2 } from '../../../server/shared/math';

import * as Events from '../../event/internal';
import { PlayerManager } from '../player-module/player-manager';

export interface NearbyBuilding {
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	bitmap: number[];
}

@injectable()
export class BuildingManager extends ClientSideManager {
	private buildingsNearby: NearbyBuilding[] = [];

	constructor(@inject(PlayerManager) private playerManager: PlayerManager) {
		super();
	}

	setBuildingsNearby(buildingsNearby: NearbyBuilding[]) {
		this.buildingsNearby = buildingsNearby;
	}

	private getCurrentBuilding() {
		const player = this.playerManager.getCurrentPlayer();
		return this.checkInBuilding(player.vPos);
	}

	private checkInBuilding(pos: Vector2) {
		for (const building of this.buildingsNearby) {
			if (pos.x > building.fromX && pos.x < building.toX && pos.y > building.fromY && pos.y < building.toY) {
				return building;
			}
		}
		return undefined;
	}

	doUpdateTick() {}
}
