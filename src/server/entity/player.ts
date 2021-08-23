import { Actor, ActorType } from '../shared/entity';
import { Vector2 } from '../shared/math';
import { BuildLandHash, GetRadiusLands, Land } from './land';

export function BuildPlayerHash(item: string | Player): string {
	if (item instanceof Player) return BuildPlayerHash(item.getConnId());

	return `player.connid.${item}`;
}

export enum PlayerEvent {
	LandUsedEvent = 'LandUsedEvent',
	LandNeverUsedEvent = 'LandNeverUsedEvent',
	SpawnActorEvent = 'SpawnActorEvent',
	DespawnActorEvent = 'DespawnActorEvent',
	PlayerRemovedEvent = 'PlayerRemovedEvent',
	PlayerAddedEvent = 'PlayerAddedEvent',
}

export class Player extends Actor {
	private viewLandRadius = 1;

	private connId: string;
	private usedLands = new Map<string, Land>();
	private spawnedActors = new Set<Actor>();
	private playerName: string = 'Player';

	constructor(connId: string, pos: Vector2) {
		super(pos, ActorType.PLAYER);
		this.connId = connId;
	}

	setName(name: string) {
		this.playerName = name;
	}
	getName() {
		return this.playerName;
	}
	hasSpawned(actor: Actor) {
		return this.spawnedActors.has(actor);
	}
	spawnActor(actor: Actor) {
		if (this.hasSpawned(actor)) return;

		console.debug(`Spawn ${actor.getActorId()} To ${this.getConnId()}`);

		this.spawnedActors.add(actor);
		this.emit(PlayerEvent.SpawnActorEvent, actor, this);
	}
	despawnActor(actor: Actor) {
		if (!this.hasSpawned(actor)) return;

		console.debug(`Despawn ${actor.getActorId()} To ${this.getConnId()}`);

		this.spawnedActors.delete(actor);
		this.emit(PlayerEvent.DespawnActorEvent, actor, this);
	}
	hasLand(land: Land) {
		return this.usedLands.has(BuildLandHash(land));
	}
	addLand(land: Land) {
		this.usedLands.set(BuildLandHash(land), land);
		this.emit(PlayerEvent.LandUsedEvent, land, this);
	}
	removeLand(land: Land) {
		this.usedLands.delete(BuildLandHash(land));
		this.emit(PlayerEvent.LandNeverUsedEvent, land, this);
	}
	setLands(lands: Land[]) {
		const newLands = [];
		const delLands = [];

		const nowLands = Array.from(this.usedLands.values());
		for (const land of nowLands) {
			if (!lands.find((la) => la == land)) delLands.push(land);
		}

		for (const land of lands) {
			if (!nowLands.find((la) => la == land)) newLands.push(land);
		}

		for (const land of newLands) {
			this.addLand(land);
		}
		for (const land of delLands) {
			this.removeLand(land);
		}
	}
	getCanseeLands() {
		return GetRadiusLands(this.pos, this.viewLandRadius);
	}
	canSeeLand(landLoc: Vector2) {
		return Boolean(
			this.getCanseeLands().find((pos) => {
				return pos.equals(landLoc);
			}),
		);
	}

	getConnId() {
		return this.connId;
	}

	isPlayer() {
		return true;
	}
}
