import { BuildPlayerHash, Player, PlayerEvent } from "../entity/player";
import { IndexedStore } from "../../shared/store";
import { Manager } from "../layer/manager";
import { ActorManager } from "./actor-manager";
import { Actor } from "../layer/entity";
import { Land } from "../entity/land";

export class PlayerManager extends Manager{
    constructor(
            private players : IndexedStore<Player>,
            private actorManager : ActorManager,
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