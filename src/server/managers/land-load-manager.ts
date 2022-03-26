import { inject, injectable } from 'inversify';
import { HandleEvent } from '@uni.js/event';
import { ServerSideManager } from '@uni.js/server';
import { LandMgr, LandMgrEvents } from './land-manager';
import { PlayerMgr, PlayerMgrEvents } from './player-manager';

import { Vector2 } from '../utils/math';
import { TaskWorker } from '../utils/tools';

@injectable()
export class LandLoadMgr extends ServerSideManager {
	private loadWorker: TaskWorker<Vector2>;

	constructor(@inject(PlayerMgr) private playerMgr: PlayerMgr, @inject(LandMgr) private landMgr: LandMgr) {
		super();

		this.loadWorker = new TaskWorker(this.onLoadTask.bind(this));
	}

	@HandleEvent('landMgr', 'LandLoadedEvent')
	private onLandLoaded(event: LandMgrEvents['LandLoadedEvent']) {
		const players = this.playerMgr.getAllEntities();
		const landPos = new Vector2(event.landPosX, event.landPosY);

		for (const player of players) {
			if (!this.playerMgr.isUseLand(player, landPos)) continue;

			this.landMgr.sendLandDataToPlayer(player.id, landPos);
		}
	}

	@HandleEvent('playerMgr', 'LandUsedEvent')
	private onLandUsedEvent(event: PlayerMgrEvents['LandUsedEvent']) {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		this.landMgr.ensureLand(landPos);

		if (this.landMgr.isLandLoaded(landPos)) {
			this.landMgr.sendLandDataToPlayer(event.playerId, landPos);
		} else {
			this.loadWorker.addTask(landPos);
		}
	}

	private async onLoadTask(landPos: Vector2) {
		await this.landMgr.loadLand(landPos);
	}

	doTick() {
		this.loadWorker.doTick();
	}
}
