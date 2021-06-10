import { LandLocToLoc, LocToLandLoc } from "../../server/land/helper";
import { Vector2 } from "../../server/shared/math";
import { ObjectStore } from "../../shared/store";
import { StoreManager } from "../layer/manager";
import { BuildLandObjectIdHash, BuildLandObjectLocHash, LandObject } from "../object/land";

export class LandManager extends StoreManager{
    constructor(private landStore : ObjectStore<LandObject>){
        super();

    }
    addLand(item : LandObject){
        this.landStore.add(item);
    }
    removeLand(item : LandObject){
        this.landStore.remove(item);
    }
    getLandById(id : string){
        return this.landStore.get(BuildLandObjectIdHash(id));
    }
    getLandByLoc(landLoc : Vector2){
        return this.landStore.get(BuildLandObjectLocHash(landLoc));
    }
    getBrickByLoc(loc : Vector2){
        const landLoc = LocToLandLoc(loc);
        const startAt = LandLocToLoc(landLoc);


        const land = this.getLandByLoc(landLoc);
        if(!land)return;

        const rawOffLoc = loc.sub(startAt);
        const offLoc = new Vector2(Math.floor(rawOffLoc.x),Math.floor(rawOffLoc.y));
        const brick = land.getBrickByOffset(offLoc);

        return brick;
    }
    async doTick(tick: number){

    }

}