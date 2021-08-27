import { ActorNewPosEvent, ActorSetStateEvent } from '../../event/server-side';
import { EventBus } from '../../event/bus-server';
import { Actor } from '../shared/entity';
import { ActorManager } from '../manager/actor-manager';
import { PlayerManager } from '../manager/player-manager';
import { Service } from '../shared/service';
import { LandManager } from '../manager/land-manager';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { Vector2 } from '../shared/math';

@injectable()
export class ActorService implements Service {
	constructor(
		@inject(EventBus) private eventBus: EventBus,

		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(LandManager) private landManager: LandManager,
	) {
		this.actorManager.on(GameEvent.NewPosEvent, this.onNewPosEvent.bind(this));
		this.actorManager.on(GameEvent.AddActorEvent, this.onActorAdded.bind(this));
		this.actorManager.on(GameEvent.RemoveActorEvent, this.onActorRemoved.bind(this));
		this.actorManager.on(GameEvent.NewBaseStateEvent, this.onBaseStateSet.bind(this));

		//		this.playerManager.on(GameEvent.PlayerAddedEvent,this.onPlayerAdded);
	}

	private onActorAdded(actorId: number) {
		for (const player of this.playerManager.getAllPlayers()) {
			if (!this.playerManager.hasSpawnedActor(player, actorId)) this.playerManager.spawnActor(player, actorId);
		}
	}
	private onActorRemoved(actorId: number) {
		for (const player of this.playerManager.getAllPlayers()) {
			if (this.playerManager.hasSpawnedActor(player, actorId)) this.playerManager.despawnActor(player, actorId);
		}
	}
	private onBaseStateSet(actorId: number) {
		const actor = this.actorManager.getActorById(actorId);

		const event = new ActorSetStateEvent(actorId, actor.direction, actor.walking);
		this.emitToActorSpawned(actorId, event);
	}
	private onNewPosEvent(actorId: number) {
		const actor = this.actorManager.getActorById(actorId);

		const event = new ActorNewPosEvent(actorId, actor.posX, actor.posY);

		this.emitToActorSpawned(actorId, event);
	}
	private emitToActorSpawned(actorId: number, event: any) {
		const sids = this.playerManager
			.getAllPlayers()
			.filter((player) => this.playerManager.hasSpawnedActor(player, actorId))
			.map((player) => player.connId);

		this.eventBus.emitTo(sids, event);
	}
	doTick(tick: number) {}
}
