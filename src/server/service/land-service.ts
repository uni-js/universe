import { EventBus } from '../../event/bus-server';
import { AddLandEvent, RemoveLandEvent } from '../../event/server-side';
import { Player } from '../entity/player';
import { Service } from '../shared/service';
import { PlayerManager } from '../manager/player-manager';
import { inject, injectable } from 'inversify';
import { LandManager } from '../manager/land-manager';
import { GameEvent } from '../event';
import { Vector2 } from '../shared/math';
import { LandData } from '../land/types';
import { TaskWorker } from '../utils';

@injectable()
export class LandService implements Service {
	private loadWorker: TaskWorker<Vector2>;

	constructor(
		@inject(EventBus) private eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		this.playerManager.on(GameEvent.LandUsedEvent, this.onLandUsedEvent);
		this.playerManager.on(GameEvent.LandNeverUsedEvent, this.onLandNeverUsedEvent);

		this.landManager.on(GameEvent.LandLoaded, this.onLandLoaded);
		this.landManager.on(GameEvent.LandDataToPlayer, this.onLandDataToPlayer);
		this.loadWorker = new TaskWorker(this.onLoadTask);
	}
	private onLoadTask = async (landPos: Vector2) => {
		await this.landManager.loadLand(landPos);
	};
	private onLandDataToPlayer = (playerId: number, landId: number, landLocX: number, landLocY: number, landData: LandData) => {
		const event = new AddLandEvent(landId, landLocX, landLocY, landData);
		const player = this.playerManager.getEntityById(playerId);

		this.eventBus.emitTo([player.connId], event);
	};
	private onLandLoaded = (landPos: Vector2) => {
		const players = this.playerManager.getAllEntities();

		for (const player of players) {
			if (!this.playerManager.isUseLand(player, landPos)) continue;

			this.landManager.sendLandDataToPlayer(player.$loki, landPos);
		}
	};
	private onLandUsedEvent = (player: Player, landPos: Vector2) => {
		if (this.landManager.isLandLoaded(landPos)) {
			this.landManager.sendLandDataToPlayer(player.$loki, landPos);
		} else {
			this.loadWorker.addTask(landPos);
		}
	};
	private onLandNeverUsedEvent = (player: Player, landPos: Vector2) => {
		const land = this.landManager.getLand(landPos);

		const event = new RemoveLandEvent(land.$loki, land.landLocX, land.landLocY);
		this.eventBus.emitTo([player.connId], event);
	};
	doTick() {
		this.loadWorker.doTick();
	}
}
