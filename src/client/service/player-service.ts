import { inject, injectable } from "inversify";
import { EventBusClient } from "../../event/bus-client";
import { MovePlayerEvent, SetPlayerStateEvent } from "../../event/client-side";
import { LoginedEvent } from "../../event/server-side";
import { Vector2 } from "../../server/shared/math";
import { ActorManager } from "../manager/actor-manager";
import { PlayerManager } from "../manager/player-manager";
import { Player } from "../object/player";
import { GameEvent } from "../event";

@injectable()
export class PlayerService{
    constructor(
        @inject(EventBusClient) private eventBus : EventBusClient,
        @inject(PlayerManager) private playerManager : PlayerManager,
        @inject(ActorManager) private actorManager : ActorManager
    ){
        this.eventBus.on(LoginedEvent.name,this.handleLogined.bind(this));

        this.playerManager.on(GameEvent.ControlMovedEvent,this.onControlMove.bind(this));
        this.playerManager.on(GameEvent.SetActorStateEvent,this.onSetActorState.bind(this));
        
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

