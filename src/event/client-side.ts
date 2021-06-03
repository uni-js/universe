import { RemoteEvent } from "./event";

export class MovePlayerEvent extends RemoteEvent{
    constructor(
        public x:number,
        public y:number
    ){ super(); }
}

export class LoginEvent extends RemoteEvent{
    constructor(
        
    ){ super(); }

}