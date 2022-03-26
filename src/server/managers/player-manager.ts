import { Player } from '../entity/player-entity';
import { Actor } from '../entity/actor-entity';
import { GetRadiusLands } from '../entity/land-entity';
import { inject, injectable } from 'inversify';
import { ActorMgr, ActorMgrEvents } from './actor-manager';
import { Vector2 } from '../utils/math';
import { GetArrayDiff } from '../utils/tools';
import { GetConstructOptions } from '../utils/entity';

import { LandMgr } from './land-manager';
import { HandleEvent } from '@uni.js/event';
import { ExtendedEntityManager, AddEntityEvent, RemoveEntityEvent, EntityBaseEvent } from '@uni.js/database';
import { GetPosByHash, GetPosHash } from '../utils/land-pos';
import { AttachType } from '../types/actor';

export interface PlayerMgrEvents extends EntityBaseEvent {
	SpawnActorEvent: {
		fromPlayerId: number;
		actorId: number;
		actorType: number;
		ctorOption: any;
	};
	DespawnActorEvent: {
		fromPlayerId: number;
		actorId: number;
	};
	LandUsedEvent: {
		landId: number;
		landPosX: number;
		landPosY: number;
		playerId: number;
	};
	LandNeverUsedEvent: {
		playerId: number;
		landId: number;
		landPosX: number;
		landPosY: number;
	};
	ToggleUsingEvent: {
		playerId: number;
		startOrEnd: boolean;
		useTick: number;
	};
}

@injectable()
export class PlayerMgr extends ExtendedEntityManager<Actor, Player, PlayerMgrEvents> {
	constructor(@inject(ActorMgr) private actorMgr: ActorMgr, @inject(LandMgr) private landMgr: LandMgr) {
		super(actorMgr, Player);
	}

	@HandleEvent('actorMgr', 'AddEntityEvent')
	private onActorAdded(event: AddEntityEvent) {
		for (const player of this.getAllEntities()) {
			this.spawnActor(player, event.entityId);
		}
	}

	@HandleEvent('actorMgr', 'RemoveEntityEvent')
	private onActorRemoved(event: RemoveEntityEvent) {
		for (const player of this.getAllEntities()) {
			this.despawnActor(player, event.entityId);
		}
	}

	@HandleEvent('actorMgr', 'NewPosEvent')
	private onActorNewPos(event: ActorMgrEvents['NewPosEvent']) {
		const player = this.actorMgr.getEntityById(event.actorId) as Player;
		if (!player.isPlayer) return;

		this.updateUsedLands(player);
	}

	startUsing(playerId: number) {
		const player = <Player>this.getEntityById(playerId);

		player.isUsing = true;
		player.useTick = 0;

		this.actorMgr.updateEntity(player);

		this.emit('ToggleUsingEvent', { playerId: player.id, startOrEnd: true, useTick: 0 });
	}

	endUsing(playerId: number) {
		const player = <Player>this.getEntityById(playerId);
		const useTick = player.useTick;

		player.isUsing = false;
		player.useTick = 0;

		this.actorMgr.updateEntity(player);

		this.emit('ToggleUsingEvent', { playerId: player.id, startOrEnd: false, useTick });
	}

	private updateUsing() {
		const playersIsUsing = <Player[]>this.findEntities({ isUsing: true });
		for (const player of playersIsUsing) {
			player.useTick++;
			this.updateEntity(player);
		}
	}

	isUseLand(player: Player, landPos: Vector2) {
		return player.usedLands.has(GetPosHash(landPos));
	}

	getCanSeeLands(player: Player) {
		return GetRadiusLands(new Vector2(player.posX, player.posY), 1);
	}

	isPlayerCansee(player: Player, landPos: Vector2) {
		const lands = this.getCanSeeLands(player);
		const result = lands.find((vec2) => {
			return vec2.equals(landPos);
		});
		return Boolean(result);
	}

	getAllEntities(): Readonly<Player>[] {
		return this.findEntities({ isPlayer: true });
	}

	getAttachment(playerId: number, attachType: AttachType) {
		const player = this.getEntityById(playerId);
		return player.attachments.get(attachType);
	}

	addNewPlayer(connId: string) {
		const player = new Player();
		player.connId = connId;
		player.posX = 0;
		player.posY = 0;

		this.addNewEntity(player);
		this.updateUsedLands(player);

		return player;
	}

	spawnActor(player: Player, actorId: number) {
		if (player.spawnedActors.has(actorId)) return;

		const actor = this.actorMgr.getEntityById(actorId);

		player.spawnedActors.add(actorId);
		const ctorOption = GetConstructOptions(actor);

		this.emit('SpawnActorEvent', { actorId, actorType: actor.type, fromPlayerId: player.id, ctorOption });
	}

	despawnActor(player: Player, actorId: number) {
		if (!player.spawnedActors.has(actorId)) return;

		player.spawnedActors.remove(actorId);
		this.emit('DespawnActorEvent', { actorId, fromPlayerId: player.id });
	}

	useLand(player: Player, landHash: string) {
		const landPos = GetPosByHash(landHash);

		player.usedLands.add(landHash);
		this.emit('LandUsedEvent', { playerId: player.id, landPosX: landPos.x, landPosY: landPos.y, landId: undefined });
	}

	unuseLand(player: Player, landHash: string) {
		const landPos = GetPosByHash(landHash);
		const land = this.landMgr.getLand(landPos);

		player.usedLands.remove(landHash);
		this.emit('LandNeverUsedEvent', { playerId: player.id, landPosX: landPos.x, landPosY: landPos.y, landId: land.id });
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

	doTick() {
		this.updateUsing();
	}
}
