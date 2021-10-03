import { Player } from '../entity/player';
import { ExtendedEntityManager } from '../shared/manager';
import { Actor, GetCtorOptions } from '../shared/entity';
import { GetRadiusLands } from '../entity/land';
import { inject, injectable } from 'inversify';
import { ActorManager } from './actor-manager';
import { Vector2 } from '../shared/math';
import { GameEvent } from '../event';
import { GetArrayDiff } from '../utils';
import { GetPosByHash, GetPosHash } from '../../shared/land';
import { ActorType } from '../../shared/actor';

export interface PlayerCreatingInfo {
	connId: string;
	posX: number;
	posY: number;
}

@injectable()
export class PlayerManager extends ExtendedEntityManager<Actor, Player> {
	constructor(@inject(ActorManager) private actorManager: ActorManager) {
		super(actorManager);

		this.actorManager.on(GameEvent.NewPosEvent, this.onActorNewPos);
	}

	private onActorNewPos = (actorId: number) => {
		const player = this.actorManager.getEntityById(actorId) as Player;
		if (!player.isPlayer) return;

		this.updateUsedLands(player);
	};

	isUseLand(player: Player, landPos: Vector2) {
		return this.hasAtRecord(player, 'usedLands', GetPosHash(landPos));
	}

	getCanSeeLands(player: Player) {
		return GetRadiusLands(new Vector2(player.posX, player.posY), 1);
	}

	addNewEntity(): Player {
		throw new Error(`use addNewPlayer API instead.`);
	}

	addNewPlayer(info: PlayerCreatingInfo) {
		const player = new Player();
		player.connId = info.connId;
		player.posX = 0;
		player.posY = 0;
		player.type = ActorType.PLAYER;

		this.actorManager.addNewEntity(player);
		this.updateUsedLands(player);

		return player;
	}

	spawnActor(player: Player, actorId: number) {
		this.addAtRecord(player, 'spawnedActors', actorId);

		const actor = this.actorManager.getEntityById(actorId);
		const ctorOption = GetCtorOptions(actor);

		this.emit(GameEvent.SpawnActorEvent, actorId, player, ctorOption);
	}

	despawnActor(player: Player, actorId: number) {
		this.removeAtRecord(player, 'spawnedActors', actorId);
		this.emit(GameEvent.DespawnActorEvent, actorId, player);
	}

	useLand(player: Player, landHash: string) {
		this.addAtRecord(player, 'usedLands', landHash);
		this.emit(GameEvent.LandUsedEvent, player, GetPosByHash(landHash));
	}

	unuseLand(player: Player, landHash: string) {
		this.removeAtRecord(player, 'usedLands', landHash);
		this.emit(GameEvent.LandNeverUsedEvent, player, GetPosByHash(landHash));
	}

	private updateUsedLands(player: Player) {
		const landsPos = GetRadiusLands(new Vector2(player.posX, player.posY), 1).map(GetPosHash);

		const diff = GetArrayDiff(player.usedLands.getAll(), landsPos);

		for (const item of diff.add) {
			this.useLand(player, item);
		}
		for (const item of diff.remove) {
			this.unuseLand(player, item);
		}
	}
}
