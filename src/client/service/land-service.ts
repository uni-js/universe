import { EventBusClient } from "../../event/bus-client";
import { AddLandEvent, RemoveLandEvent } from "../../event/server-side";
import { Vector2 } from "../../server/shared/math";
import { ObjectManager } from "../manager/object-manager";
import { Land } from "../object/land";
import { TextureManager } from "../texture";

export class LandService{
    constructor(
            private eventBus : EventBusClient,
            private objectManager : ObjectManager,
            private textureManager : TextureManager,
            
        ){
        this.eventBus.on(AddLandEvent.name,this.handleLandAdded);
        this.eventBus.on(RemoveLandEvent.name,this.handleLandRemoved);
        
    }
    private handleLandAdded = (event : AddLandEvent)=>{
       
        const loc = new Vector2(event.landX,event.landY);
        const land = new Land(event.landData,this.textureManager,event.entityId,loc);
        this.objectManager.addObject(land);

    }
    private handleLandRemoved = (event : RemoveLandEvent)=>{
        
        const object = this.objectManager.getObjectById(event.entityId)!;
        this.objectManager.removeObject(object);

    }
    
}