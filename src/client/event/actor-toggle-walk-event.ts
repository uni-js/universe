import type { Direction, RunningState } from "../../server/module/actor-module/spec";

export class ActorToggleWalkEvent {
    actorId: number;
	running: RunningState;
	direction: Direction;
}
