import { injectable } from "inversify";
import { IndexedStore } from "../../shared/store";
import { BuildLandHash, Land } from "../entity/land";
import { BuildPlayerHash, Player } from "../entity/player";
import { Actor, BuildActorHash } from "./entity";

@injectable()
export class LandStore extends IndexedStore<Land>{
    constructor(){
        super(BuildLandHash);
    }
}

@injectable()
export class ActorStore extends IndexedStore<Actor>{
    constructor(){
        super(BuildActorHash);
    }
}

@injectable()
export class PlayerStore extends IndexedStore<Player>{
    constructor(){
        super(BuildPlayerHash);
    }
}


