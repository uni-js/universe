import { inject, injectable } from 'inversify';
import { Player } from '../entity/player';
import { GameEvent } from '../event';
import { PosToLandPos } from '../land/helper';
import { Actor } from '../shared/entity';
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
		this.actorManager.on(GameEvent.RemoveEntityEvent, this.onActorRemoved);
	}
	private onActorRemoved = (actorId: number, actor: Actor) => {
		const pos = new Vector2(actor.posX, actor.posY);
		const landPos = PosToLandPos(pos);
		this.landManager.removeLandActor(landPos, actorId);
	};
	private onActorLandMoved = (actorId: number, landPos: Vector2, lastLandPos?: Vector2) => {
		if (lastLandPos) this.landManager.removeLandActor(lastLandPos, actorId);

		this.landManager.ensureLand(landPos);
		this.landManager.addLandActor(landPos, actorId);
	};
	private onLandUsed = (player: Player, landPos: Vector2) => {
		this.landManager.ensureLand(landPos);

		//		const land = this.landManager.getLand(landPos);

		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.spawnActor(player, actorId);
		}
	};
	private onLandNeverUsed = (player: Player, landPos: Vector2) => {
		for (const actorId of this.landManager.getLandActors(landPos)) {
			this.playerManager.despawnActor(player, actorId);
		}
	};

	async doTick(tick: number) {}
}
