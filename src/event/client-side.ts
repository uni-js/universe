import { Direction, RunningState } from '../shared/actor';
import { RemoteEvent } from './event';

export class MovePlayerEvent extends RemoteEvent {
	constructor(public x: number, public y: number) {
		super();
	}
}

export class ActorToggleWalkEvent extends RemoteEvent {
	constructor(public running: RunningState, public dir: Direction) {
		super();
	}
}

export class LoginEvent extends RemoteEvent {
	constructor() {
		super();
	}
}

export class ShortcutSelectEvent extends RemoteEvent {
	constructor(public index: number) {
		super();
	}
}

export class ActorToggleUsingEvent extends RemoteEvent {
	constructor(public actorId: number, public startOrEnd: boolean) {
		super();
	}
}
