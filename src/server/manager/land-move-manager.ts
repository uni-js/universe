import { Land } from "../entity/land";
import { Player, PlayerEvent } from "../entity/player";
import { Actor, ActorEvent } from "../shared/entity";
import { Manager } from "../shared/manager";
import { Vector2 } from "../shared/math";
import { ActorManager } from "./actor-manager";
import { LandManager } from "./land-manager";
import { PlayerManager } from "./player-manager";

/**
 * 该管理器维护与Land跨越、加载有关的状态：
 * 
 * player的usedLands、spawnedActors状态
 * 
 */
export class LandMoveManager extends Manager{

    constructor(
        private playerManager : PlayerManager,
        private actorManager : ActorManager,
        private landManager : LandManager){
            super();

        this.playerManager.on(PlayerEvent.LandUsedEvent,this.onLandUsed);
        this.playerManager.on(PlayerEvent.LandNeverUsedEvent,this.onLandNeverUsed);

        this.actorManager.on(ActorEvent.AddActorEvent,this.onActorAdded);
        this.actorManager.on(ActorEvent.RemoveActorEvent,this.onActorRemoved);
    }
    private onActorAdded = (actor : Actor)=>{
        actor.on(ActorEvent.LandMoveEvent,this.onLandMoveEvent);
    }
    private onActorRemoved = (actor : Actor)=>{
        actor.off(ActorEvent.LandMoveEvent,this.onLandMoveEvent)        
        this.landManager.removeActor(actor.getLandAt(),actor);
    }
    private onLandMoveEvent = (actor : Actor,landAt:Vector2,lastLandAt:Vector2)=>{
        try{ this.landManager.removeActor(lastLandAt,actor); }catch(err){ }
        try{ this.landManager.addActor(landAt,actor); }catch(err){ }

        for(const player of this.playerManager.getAllPlayers()){
            const hasSpawned = player.hasSpawned(actor);
            const cansee = player.canSeeLand(actor.getLandAt());

            if(hasSpawned && !cansee){
                player.despawnActor(actor);
            }else if(!hasSpawned && cansee){
                player.spawnActor(actor);
            }

        }
    
    }

    private onLandUsed = (land : Land,player : Player)=>{
        for(const actor of land.getAllActors()){
            player.spawnActor(actor);
        }
        
    }
    private onLandNeverUsed  = (land : Land,player : Player)=>{
        for(const actor of land.getAllActors()){
            player.despawnActor(actor);
        }
    }
    private async doPlayerLandTick(){
        
        const players = this.playerManager.getAllPlayers();

        for(const player of players){
            const landLocs = player.getCanseeLands();
            const lands = [];

            for(const landLoc of landLocs){
                const land = await this.landManager.ensureAndGetLand(landLoc)!;
                lands.push(land);
            }

            player.setLands(lands);
        }
    }
    private doCheckLandedTick(){
        for(const actor of this.actorManager.getAll()){
            const landAt = actor.getLandAt();
            if(!this.landManager.hasActor(landAt,actor))
                this.landManager.addActor(landAt,actor);
        }

    }
    
    async doTick(tick: number){
                
        try{ this.doCheckLandedTick(); }catch(err){ }

        await this.doPlayerLandTick();

    }
    
}