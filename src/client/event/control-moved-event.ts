import type { Input } from "@uni.js/prediction";
import type { Direction, RunningState } from "../../server/module/actor-module/spec";

export class ControlMovedEvent {
    input: Input;
	direction: Direction;
	running: RunningState;
}
