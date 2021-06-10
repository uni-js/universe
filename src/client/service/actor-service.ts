import { EventBusClient } from "../../event/bus-client";
import { ActorNewPosEvent, ActorSetStateEvent, AddActorEvent, RemoveActorEvent } from "../../event/server-side";
import { ActorType } from "../../server/layer/entity";
import { Vector2 } from "../../server/shared/math";
import { ActorObject, GameObjectEvent, IGameObject } from "../layer/game-object";
import { ActorManager } from "../manager/actor-manager";
import { Player } from "../object/player";
import { TextureManager } from "../texture";

export class ActorService{
    constructor(
        private eventBus : EventBusClient,
        private actorManager : ActorManager,
        private textureManager : TextureManager
    ){
        this.eventBus.on(AddActorEvent.name,this.handleActorAdded.bind(this));
        this.eventBus.on(RemoveActorEvent.name,this.handleActorRemoved.bind(this));
        this.eventBus.on(ActorNewPosEvent.name,this.handleActorNewPos.bind(this));
        this.eventBus.on(ActorSetStateEvent.name,this.handleActorNewBaseState.bind(this));
        
    }
    private handleActorAdded(event : AddActorEvent){
        console.debug("Spawned",event.actorId,event);
        const loc = new Vector2(event.x,event.y);
        if(event.type == ActorType.PLAYER){
            

            const player = new Player(this.textureManager,event.actorId,loc,event.playerName);
            this.actorManager.addActor(player);
        }else{
            const actor = new ActorObject(event.type,this.textureManager,event.actorId,new Vector2(1,1),loc,"");
            this.actorManager.addActor(actor);

        }
    }
    private handleActorRemoved(event : RemoveActorEvent){
        const object = this.actorManager.getActorById(event.actorId);
        console.debug("Despawned",event.actorId,event,object);
        
        if(!object)return;

        this.actorManager.removeActor(object);
    }
    private handleActorNewBaseState(event : ActorSetStateEvent){
        const object = this.actorManager.getActorById(event.actorId) as ActorObject;

        object.setDirection(event.direction,false);
        object.setWalking(event.walking,false);
    }
    private handleActorNewPos(event : ActorNewPosEvent){

        
        const object = this.actorManager.getActorById(event.actorId) as ActorObject;
        object.addMovePoint(new Vector2(event.x,event.y));

    }

}