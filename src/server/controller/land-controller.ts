import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ServerController } from '../shared/controller';
import { PlayerManager } from '../manager/player-manager';
import { inject, injectable } from 'inversify';
import { LandManager } from '../manager/land-manager';
import { Vector2 } from '../shared/math';
import { TaskWorker } from '../utils';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { HandleInternalEvent } from '../../event/spec';

@injectable()
export class LandController extends ServerController {
	private loadWorker: TaskWorker<Vector2>;

	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super(eventBus);

		this.loadWorker = new TaskWorker(this.onLoadTask.bind(this));
	}

	private async onLoadTask(landPos: Vector2) {
		await this.landManager.loadLand(landPos);
	}

	@HandleInternalEvent('landManager', Events.LandDataToPlayerEvent)
	private onLandDataToPlayer(event: Events.LandDataToPlayerEvent) {
		const player = this.playerManager.getEntityById(event.playerId);

		const exEvent = new ExternalEvents.AddLandEvent();
		exEvent.landData = event.landData;
		exEvent.landX = event.landPosX;
		exEvent.landY = event.landPosY;
		exEvent.actorId = event.landId;

		this.eventBus.emitTo([player.connId], exEvent);
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

	@HandleInternalEvent('playerManager', Events.LandNeverUsedEvent)
	private onLandNeverUsedEvent(event: Events.LandNeverUsedEvent) {
		const player = this.playerManager.getEntityById(event.playerId);

		const exEvent = new ExternalEvents.RemoveLandEvent();
		exEvent.actorId = event.landId;
		exEvent.landX = event.landPosX;
		exEvent.landY = event.landPosY;

		this.eventBus.emitTo([player.connId], exEvent);
	}

	doTick() {
		this.loadWorker.doTick();
	}
}
