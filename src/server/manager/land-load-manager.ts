import { inject, injectable } from 'inversify';
import { HandleInternalEvent } from '../../event/spec';
import { Manager } from '../shared/manager';
import { LandManager } from './land-manager';
import { PlayerManager } from './player-manager';

import * as Events from '../event/internal';
import { Vector2 } from '../shared/math';
import { TaskWorker } from '../utils';

@injectable()
export class LandLoadManager extends Manager {
	private loadWorker: TaskWorker<Vector2>;

	constructor(@inject(PlayerManager) private playerManager: PlayerManager, @inject(LandManager) private landManager: LandManager) {
		super();

		this.loadWorker = new TaskWorker(this.onLoadTask.bind(this));
	}

	@HandleInternalEvent('landManager', Events.LandLoaded)
	private onLandLoaded(event: Events.LandLoaded) {
		const players = this.playerManager.getAllEntities();
		const landPos = new Vector2(event.landPosX, event.landPosY);

		for (const player of players) {
			if (!this.playerManager.isUseLand(player, landPos)) continue;

			this.landManager.sendLandDataToPlayer(player.$loki, landPos);
		}
	}

	@HandleInternalEvent('playerManager', Events.LandUsedEvent)
	private onLandUsedEvent(event: Events.LandUsedEvent) {
		const landPos = new Vector2(event.landPosX, event.landPosY);

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
