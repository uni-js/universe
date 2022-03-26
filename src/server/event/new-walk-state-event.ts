import type { Direction, RunningState } from '../types/actor';

export class NewWalkStateEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}
