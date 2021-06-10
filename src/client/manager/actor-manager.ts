import * as PIXI from "pixi.js";
import { ObjectStore } from "../../shared/store";
import { ActorObject, BuildActorObjectHash } from "../layer/game-object";
import { StoreManager } from "../layer/manager";


export class ActorManager extends StoreManager{
    constructor(
            private actorStore : ObjectStore<ActorObject>,
            private objectContainer : PIXI.Container
        ){
        super();

    }
    addActor(item : ActorObject){
        this.actorStore.add(item);
    }
    getActorById(objectId:string){
        return this.actorStore.get(BuildActorObjectHash(objectId));
    }
    removeActor(item : ActorObject){
        this.actorStore.remove(item);
    }
    async doTick(tick: number) {
        this.objectContainer.sortChildren();
    }
}