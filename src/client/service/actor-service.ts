import { EventBusClient } from "../../event/bus-client";
import { ActorNewPosEvent, AddActorEvent, RemoveActorEvent } from "../../event/server-side";
import { ActorType } from "../../server/layer/entity";
import { Vector2 } from "../../server/shared/math";
import { ActorObject } from "../layer/game-object";
import { ObjectManager } from "../manager/object-manager";
import { PlayerManager } from "../manager/player-manager";
import { Player } from "../object/player";
import { TextureManager } from "../texture";

export class ActorService{
    constructor(
        private eventBus : EventBusClient,
        private objectManager : ObjectManager,
        private textureManager : TextureManager
    ){
        this.eventBus.on(AddActorEvent.name,this.handleActorAdded.bind(this));
        this.eventBus.on(RemoveActorEvent.name,this.handleActorRemoved.bind(this));
        this.eventBus.on(ActorNewPosEvent.name,this.handleActorNewPos.bind(this));
    }
    private handleActorAdded(event : AddActorEvent){
        console.debug("Spawned",event.actorId,event);
        const loc = new Vector2(event.x,event.y);
        if(event.type == ActorType.PLAYER){
            

            const player = new Player(this.textureManager,event.actorId,loc,event.playerName);
            this.objectManager.addObject(player);
        }else{
            const actor = new ActorObject(event.type,this.textureManager,event.actorId,new Vector2(1,1),loc,"");
            this.objectManager.addObject(actor);

        }
    }
    private handleActorRemoved(event : RemoveActorEvent){
        const object = this.objectManager.getObjectById(event.actorId);
        console.debug("Despawned",event.actorId,event,object);
        
        if(!object)return;

        this.objectManager.removeObject(object);
    }
    private handleActorNewPos(event : ActorNewPosEvent){

        const object = this.objectManager.getObjectById(event.actorId) as ActorObject;
        object.setMoveTarget(new Vector2(event.x,event.y));
    }

}