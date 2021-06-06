import { EventBusClient } from "../../event/bus-client";
import { MovePlayerEvent } from "../../event/client-side";
import { LoginedEvent } from "../../event/server-side";
import { Vector2 } from "../../server/shared/math";
import { Direction, WalkingState } from "../../shared/actor";
import { ObjectManager } from "../manager/object-manager";
import { PlayerManager } from "../manager/player-manager";
import { Player, PlayerObjectEvent } from "../object/player";

export class PlayerService{
    constructor(
        private eventBus : EventBusClient,
        private playerManager : PlayerManager,
        private objectManager : ObjectManager
    ){
        this.eventBus.on(LoginedEvent.name,this.handleLogined.bind(this));

        this.playerManager.on(PlayerObjectEvent.ControlMovedEvent,this.onControlMove.bind(this));
    }
    private onControlMove(delta : Vector2,direction : Direction,walking: WalkingState){        
        this.eventBus.emitEvent(new MovePlayerEvent(delta.x,delta.y,direction,walking));
    }
    private handleLogined(event : LoginedEvent){
        console.debug("logined_event",event)
        const actorId = event.actorId;
        const player = this.objectManager.getObjectById(actorId) as Player;
        this.playerManager.setCurrentPlayer(player);
    }


}

