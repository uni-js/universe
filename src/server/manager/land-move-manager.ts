import { inject, injectable } from 'inversify';
import { Actor } from '../actor/spec';
import { PosToLandPos } from '../land/helper';
import { Manager } from '../shared/manager';
import { Vector2 } from '../shared/math';
import { ActorManager } from './actor-manager';
import { LandManager } from './land-manager';
import { PlayerManager } from './player-manager';

import * as Events from '../event/internal';
import { HandleInternalEvent } from '../../event/spec';

/**
 * 该管理器维护与Land跨越、加载有关的状态：
 *
 * player的usedLands、spawnedActors状态
 *
 */
@injectable()
export class LandMoveManager extends Manager {
	constructor(
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		super();
	}

	addLandActor(landPos: Vector2, actorId: number) {
		this.landManager.ensureLand(landPos);

		const land = this.landManager.getLand(landPos);
		this.landManager.addAtRecord(land, 'actors', actorId);
	}

	removeLandActor(landPos: Vector2, actorId: number) {
		const land = this.landManager.getLand(landPos);
		this.landManager.removeAtRecord(land, 'actors', actorId);
	}

	@HandleInternalEvent('actorManager', Events.AddEntityEvent)
	private onActorAdded(event: Events.AddEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.addLandActor(landPos, event.entityId);
	}

	@HandleInternalEvent('actorManager', Events.RemoveEntityEvent)
	private onActorRemoved(event: Events.RemoveEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.removeLandActor(landPos, event.entityId);
	}

	@HandleInternalEvent('actorManager', Events.LandMoveEvent)
	private onActorLandMoved(event: Events.LandMoveEvent) {
		const sourceLandPos = new Vector2(event.sourceLandPosX, event.sourceLandPosY);
		const targetLandPos = new Vector2(event.targetLandPosX, event.targetLandPosY);

		this.removeLandActor(sourceLandPos, event.actorId);
		this.addLandActor(targetLandPos, event.actorId);

		const players = this.playerManager.getAllEntities();
		players.forEach((player) => {
			if (this.playerManager.isPlayerCansee(player, targetLandPos)) {
				this.playerManager.spawnActor(player, event.actorId);
			} else {
				this.playerManager.despawnActor(player, event.actorId);
			}
		});
	}

	@HandleInternalEvent('playerManager', Events.LandUsedEvent)
	private onLandUsed(event: Events.LandUsedEvent) {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerManager.getEntityById(event.playerId);

		this.landManager.ensureLand(landPos);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.spawnActor(player, actorId);
		}
	}

	@HandleInternalEvent('playerManager', Events.LandNeverUsedEvent)
	private onLandNeverUsed = (event: Events.LandNeverUsedEvent) => {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerManager.getEntityById(event.playerId);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.despawnActor(player, actorId);
		}
	};
}
