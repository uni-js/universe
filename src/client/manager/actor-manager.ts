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
        console.log("add actor",item);
        this.actorStore.add(item);
    }
    getActorById(objectId:string){
        return this.actorStore.get(BuildActorObjectHash(objectId));
    }
    removeActor(item : ActorObject){
        console.log("remove actor",item);
        this.actorStore.remove(item);
    }
    private async doActorsTick(tick:number){
        const actors = this.actorStore.getAll();
        for(const actor of actors){
            await actor.doTick(tick);
        }
    }
    async doTick(tick: number) {
        await this.doActorsTick(tick);

        this.objectContainer.sortChildren();
    }
}