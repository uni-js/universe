import { Input } from "@uni.js/prediction";
import { DirectionType, RunningType } from "../actor/actor";

export class LoginEvent {
    username: string;
}
export class MoveItemEvent {
    fromCont: number;
    fromIndex: number;
    toCont: number;
    toIndex: number;
}
export class ControlMoveEvent {
    actorId: number;
	input: Input;
}
export class ControlWalkEvent{
    actorId: number;
    running: RunningType;
    direction: DirectionType;
}