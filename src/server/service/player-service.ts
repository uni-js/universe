import { EventBus } from "../../event/bus-server";
import { LoginEvent, MovePlayerEvent, SetPlayerStateEvent } from "../../event/client-side";
import { AddActorEvent, LoginedEvent,RemoveActorEvent } from "../../event/server-side";
import { Player, PlayerEvent } from "../entity/player";
import { PlayerManager } from "../manager/player-manager";
import { Vector2 } from "../shared/math";
import { Service } from "../layer/service";
import { Actor } from "../layer/entity";

export class PlayerService implements Service{
    constructor(
        private eventBus : EventBus,
        private playerManager : PlayerManager
    ){
        this.eventBus.on(LoginEvent.name,this.handleLogin.bind(this));
        this.eventBus.on(MovePlayerEvent.name,this.handleMovePlayer.bind(this))
        this.eventBus.on(SetPlayerStateEvent.name,this.handleSetActorState.bind(this))
        
        this.playerManager.on(PlayerEvent.SpawnActorEvent,this.onActorSpawned.bind(this));
        this.playerManager.on(PlayerEvent.DespawnActorEvent,this.onActorDespawned.bind(this));
  
        
        
    }
    private handleSetActorState(connId:string,event : SetPlayerStateEvent){
        
        const player = this.playerManager.getPlayerByConnId(connId)!;
        player.setWalking(event.walking);
        player.setDirection(event.dir);

    }
    private onActorSpawned(actor:Actor,player:Player){
        const loc = actor.getLocation();
        const event = new AddActorEvent(actor.getActorId(),player.getName(),actor.getType(),loc.x,loc.y);

        this.eventBus.emitTo([player.getConnId()],event);

    }
    private onActorDespawned(actor:Actor,player:Player){

        const event = new RemoveActorEvent(actor.getActorId());
        this.eventBus.emitTo([player.getConnId()],event);

    }
    private handleLogin(connId:string,){
        
        const player = new Player(connId,new Vector2(0,0));
        this.playerManager.addPlayer(player);

        this.eventBus.emitTo([connId],new LoginedEvent(player.getActorId()));
        console.log(`user logined :`,player.getConnId());
    }
    private handleMovePlayer(connId:string,event:MovePlayerEvent){

        const player = this.playerManager.getPlayerByConnId(connId)!;
        player.moveDelta(new Vector2(event.x,event.y));

    }
    
    async doTick(tick: number): Promise<void> {

    }
}