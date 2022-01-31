import { inject, injectable } from 'inversify';
import { Actor } from '../actor-module/actor-entity';
import { PosToLandPos } from './helper';
import { ServerSideManager } from '@uni.js/server';
import { Vector2 } from '../../shared/math';
import { ActorManager, ActorManagerEvents } from '../actor-module/actor-manager';
import { LandManager } from './land-manager';
import { PlayerManager, PlayerManagerEvents } from '../player-module/player-manager';

import { HandleEvent } from '@uni.js/event';
import { AddEntityEvent, RemoveEntityEvent } from '@uni.js/database';

/**
 * maintaining land crossing and land loading
 */
@injectable()
export class LandMoveManager extends ServerSideManager {
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
		land.actors.add(actorId)
	}

	removeLandActor(landPos: Vector2, actorId: number) {
		const land = this.landManager.getLand(landPos);
		land.actors.remove(actorId)
	}

	@HandleEvent('actorManager', "AddEntityEvent")
	private onActorAdded(event: AddEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.addLandActor(landPos, event.entityId);
	}

	@HandleEvent('actorManager', "RemoveEntityEvent")
	private onActorRemoved(event: RemoveEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.removeLandActor(landPos, event.entityId);
	}

	@HandleEvent('actorManager', "LandMoveEvent")
	private onActorLandMoved(event: ActorManagerEvents['LandMoveEvent']) {
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

	@HandleEvent('playerManager', "LandUsedEvent")
	private onLandUsed(event: PlayerManagerEvents['LandUsedEvent']) {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerManager.getEntityById(event.playerId);

		this.landManager.ensureLand(landPos);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.spawnActor(player, actorId);
		}
	}

	@HandleEvent('playerManager', "LandNeverUsedEvent")
	private onLandNeverUsed = (event: PlayerManagerEvents['LandNeverUsedEvent']) => {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerManager.getEntityById(event.playerId);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.despawnActor(player, actorId);
		}
	};
}
