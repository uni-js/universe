import { LandData } from '../server/land/types';
import { ActorType } from '../server/shared/entity';
import { Direction, WalkingState } from '../shared/actor';
import { RemoteEvent } from './event';

export class ActorNewPosEvent extends RemoteEvent {
	constructor(public actorId: number, public x: number, public y: number) {
		super();
	}
}

export class ActorSetStateEvent extends RemoteEvent {
	constructor(public actorId: number, public direction: Direction, public walking: WalkingState) {
		super();
	}
}

export class LoginedEvent extends RemoteEvent {
	constructor(public actorId: number) {
		super();
	}
}

export class AddActorEvent extends RemoteEvent {
	constructor(public actorId: number, public playerName: string, public type: ActorType, public x: number, public y: number) {
		super();
	}
}

export class RemoveActorEvent extends RemoteEvent {
	constructor(public actorId: number) {
		super();
	}
}

export class AddLandEvent extends RemoteEvent {
	constructor(public entityId: number, public landX: number, public landY: number, public landData: LandData) {
		super();
	}
}

export class RemoveLandEvent extends RemoteEvent {
	constructor(public entityId: number, public landX: number, public landY: number) {
		super();
	}
}
