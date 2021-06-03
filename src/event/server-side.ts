import { LandData } from "../server/land/types";
import { ActorType } from "../server/layer/entity";
import { RemoteEvent } from "./event";

export class ActorNewPosEvent extends RemoteEvent{
    constructor(
        public actorId:string,
        public x:number,
        public y:number
    ){ super(); }
}

export class LoginedEvent extends RemoteEvent{
    constructor(
        public actorId:string
    ){ super(); }
}

export class AddActorEvent extends RemoteEvent{
    constructor(
        public actorId:string,
        public type:ActorType,
        public x:number,
        public y:number
    ){ super(); }
}

export class RemoveActorEvent extends RemoteEvent{
    constructor(
        public actorId:string,
    ){ super(); }
}

export class AddLandEvent extends RemoteEvent{
    constructor(
        public entityId:string,
        public landX:number,
        public landY:number,
        public landData:LandData
    ){ super(); }
}

export class RemoveLandEvent extends RemoteEvent{
    constructor(
        public entityId:string,
        public landX:number,
        public landY:number
    ){ super(); }    
}
