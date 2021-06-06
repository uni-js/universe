import { ActorNewPosEvent } from "../../event/server-side";
import { EventBus } from "../../event/bus-server";
import { Actor, ActorEvent } from "../layer/entity";
import { ActorManager } from "../manager/actor-manager";
import { PlayerManager } from "../manager/player-manager";
import { Service } from "../layer/service";
import { LandManager } from "../manager/land-manager";


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
    private onNewPosEvent(actor : Actor){
        
        const sids = this.playerManager.getAllPlayers()
            .filter((player)=>player.hasSpawned(actor))
            .map(((player)=>player.getConnId()));

        const event = new ActorNewPosEvent(
            actor.getActorId(),
            actor.getLocation().x,
            actor.getLocation().y,
            actor.getDirection(),
            actor.getWalking()
        );

        this.eventBus.emitTo(sids,event);
    }
    async doTick(tick: number) {

    }
}