import { EventBusClient } from "../../event/bus-client";
import { MovePlayerEvent, SetPlayerStateEvent } from "../../event/client-side";
import { LoginedEvent } from "../../event/server-side";
import { Vector2 } from "../../server/shared/math";
import { GameObjectEvent } from "../layer/game-object";
import { ActorManager } from "../manager/actor-manager";
import { PlayerManager } from "../manager/player-manager";
import { Player, PlayerObjectEvent } from "../object/player";

export class PlayerService{
    constructor(
        private eventBus : EventBusClient,
        private playerManager : PlayerManager,
        private actorManager : ActorManager
    ){
        this.eventBus.on(LoginedEvent.name,this.handleLogined.bind(this));

        this.playerManager.on(PlayerObjectEvent.ControlMovedEvent,this.onControlMove.bind(this));
        this.playerManager.on(GameObjectEvent.SetActorStateEvent,this.onSetActorState.bind(this));
        
    }
    private onControlMove(delta : Vector2){
        this.eventBus.emitEvent(new MovePlayerEvent(delta.x,delta.y));
    }
    private onSetActorState(player : Player){
        this.eventBus.emitEvent(new SetPlayerStateEvent(player.getWalking(),player.getDirection()));
    }
    private handleLogined(event : LoginedEvent){
        console.debug("logined_event",event)
        const actorId = event.actorId;
        const player = this.actorManager.getActorById(actorId) as Player;
        this.playerManager.setCurrentPlayer(player);
    }


}

