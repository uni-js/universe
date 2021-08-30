import { Player } from '../entity/player';
import { Manager } from '../shared/manager';
import { Actor, ActorType } from '../shared/entity';
import { GetRadiusLands } from '../entity/land';
import { inject, injectable } from 'inversify';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { ActorManager } from './actor-manager';
import { Vector2 } from '../shared/math';
import { GameEvent } from '../event';
import { GetArrayDiff } from '../utils';
import { GetPosByHash, GetPosHash } from '../../shared/land';

export interface PlayerCreatingInfo {
	connId: string;
	posX: number;
	posY: number;
}

@injectable()
export class PlayerManager extends Manager {
	constructor(
		@injectCollection(Actor) private playerList: ICollection<Player>,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super();

		this.actorManager.on(GameEvent.NewPosEvent, this.onActorNewPos);
	}
	private onActorNewPos = (actorId: number) => {
		const player = this.actorManager.getActorById(actorId) as Player;
		if (!player.isPlayer) return;

		this.updateUsedLands(player);
	};

	spawnActor(player: Player, actorId: number) {
		if (player.spawnedActors.includes(actorId)) return;

		player.spawnedActors.push(actorId);
		this.playerList.update(player);

		this.emit(GameEvent.SpawnActorEvent, actorId, player);
	}
	hasSpawnedActor(player: Player, actorId: number) {
		return player.spawnedActors.includes(actorId);
	}
	despawnActor(player: Player, actorId: number) {
		if (!player.spawnedActors.includes(actorId)) return;

		const index = player.spawnedActors.indexOf(actorId);
		player.spawnedActors.splice(index, 1);
		this.playerList.update(player);

		this.emit(GameEvent.DespawnActorEvent, actorId, player);
	}

	getAllPlayers() {
		return this.playerList.find();
	}
	isUseLand(player: Player, landPos: Vector2) {
		return player.usedLands.includes(GetPosHash(landPos));
	}
	getCanSeeLands(player: Player) {
		return GetRadiusLands(new Vector2(player.posX, player.posY), 1);
	}
	hasPlayer(connId: string) {
		return Boolean(this.playerList.findOne({ connId }));
	}
	addNewPlayer(info: PlayerCreatingInfo) {
		const player = new Player();
		player.connId = info.connId;
		player.posX = 0;
		player.posY = 0;
		player.type = ActorType.PLAYER;

		this.actorManager.addNewActor(player);

		this.updateUsedLands(player);
		this.emit(GameEvent.PlayerAddedEvent, player);

		return player;
	}
	removePlayer(player: Player) {
		this.actorManager.removeActor(player);

		this.emit(GameEvent.PlayerRemovedEvent, player);
	}

	getPlayerByConnId(connId: string) {
		return this.playerList.findOne({ connId });
	}
	getPlayerById(id: number) {
		return this.playerList.findOne({ $loki: id });
	}
	useLand(player: Player, landHash: string) {
		const index = player.usedLands.indexOf(landHash);
		if (index !== -1) return;

		player.usedLands.push(landHash);

		this.emit(GameEvent.LandUsedEvent, player, GetPosByHash(landHash));
	}
	unuseLand(player: Player, landHash: string) {
		const index = player.usedLands.indexOf(landHash);
		if (index === -1) return;

		player.usedLands.splice(index, 1);

		this.emit(GameEvent.LandNeverUsedEvent, player, GetPosByHash(landHash));
	}
	private updateUsedLands(player: Player) {
		const landsPos = GetRadiusLands(new Vector2(player.posX, player.posY), 1);
		const lands = [];
		for (const pos of landsPos) {
			lands.push(GetPosHash(pos));
		}

		const diff = GetArrayDiff(player.usedLands, lands);

		for (const item of diff.add) {
			this.useLand(player, item);
		}
		for (const item of diff.remove) {
			this.unuseLand(player, item);
		}
	}

	doTick(tick: number) {}
}
