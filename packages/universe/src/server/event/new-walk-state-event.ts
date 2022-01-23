import type { Direction, RunningState } from "../module/actor-module/spec";

export class NewWalkStateEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}
