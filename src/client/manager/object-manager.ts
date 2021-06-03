import * as PIXI from "pixi.js";
import { IndexedStore } from "../../shared/store";
import { BuildGameObjectHash, IGameObject } from "../layer/game-object";
import { StoreManager } from "../layer/manager";

export class ObjectManager extends StoreManager{
    constructor(
            private objectStore : IndexedStore<IGameObject,typeof BuildGameObjectHash>,
            private stage : PIXI.Container
        ){
        super();

        this.objectStore.on("add",(item)=>{
            this.stage.addChild(item);
        });
        this.objectStore.on("remove",(item)=>{
            this.stage.removeChild(item);
        });
    }
    addObject(item : IGameObject){
        this.objectStore.add(item);
    }
    getObjectById(objectId:string){
        return this.objectStore.get(BuildGameObjectHash(objectId));
    }
    removeObject(item : IGameObject){
        this.objectStore.remove(item);
    }
    async doTick(tick: number) {
        
    }
}