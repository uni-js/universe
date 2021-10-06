import { inject, injectable } from 'inversify';
import { Actor } from '../actor/spec';
import { Player } from '../entity/player';
import { GameEvent } from '../event';
import { PosToLandPos } from '../land/helper';
import { Manager } from '../shared/manager';
import { Vector2 } from '../shared/math';
import { ActorManager } from './actor-manager';
import { LandManager } from './land-manager';
import { PlayerManager } from './player-manager';

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

		this.playerManager.on(GameEvent.LandUsedEvent, this.onLandUsed);
		this.playerManager.on(GameEvent.LandNeverUsedEvent, this.onLandNeverUsed);

		this.actorManager.on(GameEvent.LandMoveEvent, this.onActorLandMoved);
		this.actorManager.on(GameEvent.AddEntityEvent, this.onActorAdded);
		this.actorManager.on(GameEvent.RemoveEntityEvent, this.onActorRemoved);
	}

	addLandActor(landPos: Vector2, actorId: number) {
		this.landManager.ensureLand(landPos);

		const land = this.landManager.getLand(landPos);
		this.landManager.addAtRecord(land, 'actors', actorId);

		this.playerManager.getCanseeLandPlayers(landPos).forEach((player) => {
			this.playerManager.spawnActor(player, actorId);
		});
	}

	removeLandActor(landPos: Vector2, actorId: number) {
		const land = this.landManager.getLand(landPos);
		this.landManager.removeAtRecord(land, 'actors', actorId);
	}

	private onActorAdded = (actorId: number, actor: Actor) => {
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.addLandActor(landPos, actorId);
	};

	private onActorRemoved = (actorId: number, actor: Actor) => {
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.removeLandActor(landPos, actorId);
	};
	private onActorLandMoved = (actorId: number, landPos: Vector2, lastLandPos: Vector2) => {
		this.removeLandActor(lastLandPos, actorId);
		this.addLandActor(landPos, actorId);
	};

	private onLandUsed = (player: Player, landPos: Vector2) => {
		this.landManager.ensureLand(landPos);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.spawnActor(player, actorId);
		}
	};
	private onLandNeverUsed = (player: Player, landPos: Vector2) => {
		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.despawnActor(player, actorId);
		}
	};
}
