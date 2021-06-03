import { IndexedStore } from "../../shared/store";
import { BuildLandHash, Land } from "../entity/land";
import { Actor } from "../layer/entity";
import { Manager } from "../layer/manager";
import { Vector2 } from "../shared/math";
import { IDatabase } from "../database";
import { GenerateLandData } from "../land";
import { LandEvent } from "../land/types";


export class LandManager extends Manager{
    constructor(private db : IDatabase,private lands : IndexedStore<Land,typeof BuildLandHash>){
        super();
    }

    async generateLand(landLoc : Vector2){
        const hash = BuildLandHash(landLoc);
        const landData = GenerateLandData();

        await this.db.set(hash,landData);
    }
    async loadLand(landLoc : Vector2){
        const hash = BuildLandHash(landLoc);
        let landData = await this.db.get(hash);

        if(Boolean(landData) == false){
            await this.generateLand(landLoc);
            landData = await this.db.get(hash);
        }

        const newLand = new Land(landLoc,landData);
        this.lands.add(newLand);
 
        this.emit(LandEvent.LandLoaded,newLand);

        console.debug(`加载 Land :(${landLoc.x}:${landLoc.y})`)
    }
    async unloadLand(landLoc : Vector2){
        const land = await this.getLand(landLoc);
    
        if(!land)
            throw new Error(`卸载Land失败 At: ${landLoc.x}:${landLoc.y}`);

        this.lands.remove(land);

        this.emit(LandEvent.LandUnloaded,land);
    }
    getLand(landLoc : Vector2){
        return this.lands.get(BuildLandHash(landLoc));
    }
    async ensureAndGetLand(landLoc : Vector2){
        if(!this.hasLand(landLoc))
            await this.loadLand(landLoc);
    
        return this.getLand(landLoc)!;
    }
    hasLand(landLoc : Vector2){
        return this.lands.has(BuildLandHash(landLoc));
    }
    addActor(landLoc : Vector2,actor:Actor){
        this.getLandOrFail(landLoc).addActor(actor);
        console.debug(`添加Land玩家 ${actor.getActorId()} At (${landLoc.x}:${landLoc.y})`)
    }
    hasActor(landLoc : Vector2,actor : Actor){
        return this.getLandOrFail(landLoc).hasActor(actor);
    }
    removeActor(landLoc : Vector2,actor:Actor){
        this.getLandOrFail(landLoc).removeActor(actor);        
        console.debug(`删除Land玩家 ${actor.getActorId()} At (${landLoc.x}:${landLoc.y})`)
    }
    getLandOrFail(landLoc : Vector2){

        if(!this.hasLand(landLoc))
            throw new Error(`该Land不存在`)
        return this.lands.get(BuildLandHash(landLoc))!
    }
    getLandActors(landLoc : Vector2){
        if(!this.hasLand(landLoc))
            return [];
        
        const land = this.lands.get(BuildLandHash(landLoc))!;
        return land.getAllActors();
    }
    async doTick(){

    }
}