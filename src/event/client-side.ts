import { Direction, WalkingState } from "../shared/actor";
import { RemoteEvent } from "./event";

export class MovePlayerEvent extends RemoteEvent{
    constructor(
        public x:number,
        public y:number
    ){ super(); }
}

export class SetPlayerStateEvent extends RemoteEvent{
    constructor(
        public walking:WalkingState,
        public dir:Direction
    ){ super(); }
}

export class LoginEvent extends RemoteEvent{
    constructor(
        
    ){ super(); }

}