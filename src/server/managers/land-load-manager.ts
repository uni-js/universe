import { inject, injectable } from 'inversify';
import { HandleEvent } from '@uni.js/event';
import { ServerSideManager } from '@uni.js/server';
import { LandManager, LandManagerEvents } from './land-manager';
import { PlayerManager, PlayerManagerEvents } from './player-manager';

import { Vector2 } from '../utils/math';
import { TaskWorker } from '../utils/tools';

@injectable()
export class LandLoadManager extends ServerSideManager {
	private loadWorker: TaskWorker<Vector2>;

	constructor(@inject(PlayerManager) private playerManager: PlayerManager, @inject(LandManager) private landManager: LandManager) {
		super();

		this.loadWorker = new TaskWorker(this.onLoadTask.bind(this));
	}

	@HandleEvent('landManager', 'LandLoadedEvent')
	private onLandLoaded(event: LandManagerEvents['LandLoadedEvent']) {
		const players = this.playerManager.getAllEntities();
		const landPos = new Vector2(event.landPosX, event.landPosY);

		for (const player of players) {
			if (!this.playerManager.isUseLand(player, landPos)) continue;

			this.landManager.sendLandDataToPlayer(player.id, landPos);
		}
	}

	@HandleEvent('playerManager', 'LandUsedEvent')
	private onLandUsedEvent(event: PlayerManagerEvents['LandUsedEvent']) {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		this.landManager.ensureLand(landPos);

		if (this.landManager.isLandLoaded(landPos)) {
			this.landManager.sendLandDataToPlayer(event.playerId, landPos);
		} else {
			this.loadWorker.addTask(landPos);
		}
	}

	private async onLoadTask(landPos: Vector2) {
		await this.landManager.loadLand(landPos);
	}

	doTick() {
		this.loadWorker.doTick();
	}
}
