import { EventBusClient } from "../../event/bus-client";
import { AddLandEvent, RemoveLandEvent } from "../../event/server-side";
import { Vector2 } from "../../server/shared/math";
import { ActorManager } from "../manager/actor-manager";
import { LandManager } from "../manager/land-manager";
import { LandObject } from "../object/land";
import { TextureManager } from "../texture";

export class LandService{
    constructor(
            private eventBus : EventBusClient,
            private landManager : LandManager,
            private textureManager : TextureManager,
            
        ){
        this.eventBus.on(AddLandEvent.name,this.handleLandAdded);
        this.eventBus.on(RemoveLandEvent.name,this.handleLandRemoved);
        
    }
    private handleLandAdded = (event : AddLandEvent)=>{
       
        const loc = new Vector2(event.landX,event.landY);
        const land = new LandObject(event.landData,this.textureManager,event.entityId,loc);
        this.landManager.addLand(land);

    }
    private handleLandRemoved = (event : RemoveLandEvent)=>{
        
        const land = this.landManager.getLandById(event.entityId)!;
        this.landManager.removeLand(land);

    }
    
}