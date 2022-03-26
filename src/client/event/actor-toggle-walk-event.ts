import type { Direction, RunningState } from '../../server/types/actor';

export class ActorToggleWalkEvent {
	actorId: number;
	running: RunningState;
	direction: Direction;
}
