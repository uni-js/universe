import { Direction, RunningState } from '../shared/actor';
import { RemoteEvent } from './event';

export class MovePlayerEvent extends RemoteEvent {
	constructor(public x: number, public y: number) {
		super();
	}
}

export class SetPlayerStateEvent extends RemoteEvent {
	constructor(public running: RunningState, public dir: Direction) {
		super();
	}
}

export class LoginEvent extends RemoteEvent {
	constructor() {
		super();
	}
}

export class UseItemEvent extends RemoteEvent {
	constructor() {
		super();
	}
}

export class ShortcutSelectEvent extends RemoteEvent {
	constructor(index: number) {
		super();
	}
}
