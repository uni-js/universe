import { ActorNewPosEvent, ActorSetStateEvent } from "../../event/server-side";
import { EventBus } from "../../event/bus-server";
import { Actor, ActorEvent } from "../shared/entity";
import { ActorManager } from "../manager/actor-manager";
import { PlayerManager } from "../manager/player-manager";
import { Service } from "../shared/service";
import { LandManager } from "../manager/land-manager";
import { Player } from "../entity/player";


export class ActorService implements Service{
    constructor(
            private eventBus : EventBus,
            
            private actorManager : ActorManager,
            private playerManager : PlayerManager,
            private landManager : LandManager,
            
        ){

        this.actorManager.on(ActorEvent.NewPosEvent,this.onNewPosEvent.bind(this));
        this.actorManager.on(ActorEvent.AddActorEvent,this.onActorAdded.bind(this))
        this.actorManager.on(ActorEvent.RemoveActorEvent,this.onActorRemoved.bind(this))
        this.actorManager.on(ActorEvent.NewBaseStateEvent,this.onBaseStateSet.bind(this));
        
    }

    private onActorAdded(actor : Actor){
        
        for(const player of this.playerManager.getAllPlayers()){
            if(!player.hasSpawned(actor))
                player.spawnActor(actor);

        }
    }
    private onActorRemoved(actor : Actor){
        
        for(const player of this.playerManager.getAllPlayers()){
            if(player.hasSpawned(actor))
                player.despawnActor(actor);

        }
    }
    private onBaseStateSet(actor : Actor){
        const event = new ActorSetStateEvent(actor.getActorId(),actor.getDirection(),actor.getWalking());
        this.emitToActorSpawned(actor,event);
    }
    private onNewPosEvent(actor : Actor){
        

        const event = new ActorNewPosEvent(
            actor.getActorId(),
            actor.getPosition().x,
            actor.getPosition().y
        );

        this.emitToActorSpawned(actor,event);
    }
    private emitToActorSpawned(actor : Actor,event : any){
        const sids = this.playerManager.getAllPlayers()
            .filter((player)=>player.hasSpawned(actor))
            .map(((player)=>player.getConnId()));

        this.eventBus.emitTo(sids,event);
    }
    async doTick(tick: number) {

    }
}