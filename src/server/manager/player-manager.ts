import { BuildPlayerHash, Player, PlayerEvent } from "../entity/player";
import { IndexedStore } from "../../shared/store";
import { Manager } from "../shared/manager";
import { ActorManager } from "./actor-manager";
import { Actor } from "../shared/entity";
import { Land } from "../entity/land";
import { inject, injectable } from "inversify";
import { PlayerStore } from "../shared/store";

@injectable()
export class PlayerManager extends Manager{
    constructor(
            @inject(PlayerStore) private players : PlayerStore,
            @inject(ActorManager) private actorManager : ActorManager,
        ){
        super();

    }

    private onActorSpawned = (actor : Actor,player:Player)=>{
        this.emit(PlayerEvent.SpawnActorEvent,actor,player);
    }
    private onActorDespawned = (actor : Actor,player:Player)=>{
        this.emit(PlayerEvent.DespawnActorEvent,actor,player);
    }
    private onLandUsed = (land : Land,player : Player)=>{
        this.emit(PlayerEvent.LandUsedEvent,land,player);
    }
    private onLandNeverUsed = (land : Land,player : Player)=>{
        this.emit(PlayerEvent.LandNeverUsedEvent,land,player);
    }

    getAllPlayers(){
        return this.players.getAll();
    }
    hasPlayer(connId:string){
        return this.players.has(BuildPlayerHash(connId));
    }
    addPlayer(player : Player){

        player.on(PlayerEvent.SpawnActorEvent,this.onActorSpawned);
        player.on(PlayerEvent.DespawnActorEvent,this.onActorDespawned);
        
        player.on(PlayerEvent.LandUsedEvent,this.onLandUsed);
        player.on(PlayerEvent.LandNeverUsedEvent,this.onLandNeverUsed);
        
     
        this.players.add(player);
        this.actorManager.addActor(player);

    
        this.emit(PlayerEvent.PlayerAddedEvent,player);
    }
    removePlayer(player : Player){

        this.players.remove(player);
        this.actorManager.removeActor(player);

        player.off(PlayerEvent.SpawnActorEvent,this.onActorSpawned);
        player.off(PlayerEvent.DespawnActorEvent,this.onActorDespawned);

        player.off(PlayerEvent.LandUsedEvent,this.onLandUsed);
        player.off(PlayerEvent.LandNeverUsedEvent,this.onLandNeverUsed);
        
        this.emit(PlayerEvent.PlayerRemovedEvent,player);
    }
    getPlayerByConnId(connId : string){
        return this.players.get(BuildPlayerHash(connId));
    }


    async doTick(tick: number) {

    }
}