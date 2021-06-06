import { Direction, WalkingState } from "../shared/actor";
import { RemoteEvent } from "./event";

export class MovePlayerEvent extends RemoteEvent{
    constructor(
        public x:number,
        public y:number,
        public dir : Direction,
        public walking : WalkingState
    ){ super(); }
}

export class LoginEvent extends RemoteEvent{
    constructor(
        
    ){ super(); }

}