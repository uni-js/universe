import { inject, injectable } from 'inversify';
import { Actor } from '../entity/actor-entity';
import { PosToLandPos } from '../utils/land-pos';
import { ServerSideManager } from '@uni.js/server';
import { Vector2 } from '../utils/math';
import { ActorMgr, ActorMgrEvents } from './actor-mgr';
import { LandMgr } from './land-mgr';
import { PlayerMgr, PlayerMgrEvents } from './player-mgr';

import { HandleEvent } from '@uni.js/event';
import { AddEntityEvent, RemoveEntityEvent } from '@uni.js/database';

/**
 * maintaining land crossing and land loading
 */
@injectable()
export class LandMoveMgr extends ServerSideManager {
	constructor(
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(ActorMgr) private actorMgr: ActorMgr,
		@inject(LandMgr) private landMgr: LandMgr,
	) {
		super();
	}

	addLandActor(landPos: Vector2, actorId: number) {
		this.landMgr.ensureLand(landPos);

		const land = this.landMgr.getLand(landPos);
		land.actors.add(actorId);
	}

	removeLandActor(landPos: Vector2, actorId: number) {
		const land = this.landMgr.getLand(landPos);
		land.actors.remove(actorId);
	}

	@HandleEvent('actorMgr', 'AddEntityEvent')
	private onActorAdded(event: AddEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.addLandActor(landPos, event.entityId);
	}

	@HandleEvent('actorMgr', 'RemoveEntityEvent')
	private onActorRemoved(event: RemoveEntityEvent) {
		const actor = event.entity as Actor;
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.removeLandActor(landPos, event.entityId);
	}

	@HandleEvent('actorMgr', 'LandMoveEvent')
	private onActorLandMoved(event: ActorMgrEvents['LandMoveEvent']) {
		const sourceLandPos = new Vector2(event.sourceLandPosX, event.sourceLandPosY);
		const targetLandPos = new Vector2(event.targetLandPosX, event.targetLandPosY);

		this.removeLandActor(sourceLandPos, event.actorId);
		this.addLandActor(targetLandPos, event.actorId);

		const players = this.playerMgr.getAllEntities();
		players.forEach((player) => {
			if (this.playerMgr.isPlayerCansee(player, targetLandPos)) {
				this.playerMgr.spawnActor(player, event.actorId);
			} else {
				this.playerMgr.despawnActor(player, event.actorId);
			}
		});
	}

	@HandleEvent('playerMgr', 'LandUsedEvent')
	private onLandUsed(event: PlayerMgrEvents['LandUsedEvent']) {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerMgr.getEntityById(event.playerId);

		this.landMgr.ensureLand(landPos);

		for (const actorId of this.landMgr.getLandActors(landPos)) {
			this.playerMgr.spawnActor(player, actorId);
		}
	}

	@HandleEvent('playerMgr', 'LandNeverUsedEvent')
	private onLandNeverUsed = (event: PlayerMgrEvents['LandNeverUsedEvent']) => {
		const landPos = new Vector2(event.landPosX, event.landPosY);
		const player = this.playerMgr.getEntityById(event.playerId);

		for (const actorId of this.landMgr.getLandActors(landPos)) {
			this.playerMgr.despawnActor(player, actorId);
		}
	};
}
