import { BusEvent, EventBus } from "../../event/bus-server";
import { Service } from "../shared/service";
import { PlayerManager } from "../manager/player-manager";

export class ConnectionService implements Service{
    constructor(
        private eventBus : EventBus,
        private playerManager : PlayerManager
    ){
        this.eventBus.on(BusEvent.ClientDisconnectEvent,this.onDisconnected.bind(this));
    }
    private onDisconnected(connId:string){

        const player = this.playerManager.getPlayerByConnId(connId);
        if(!player) return;

        this.playerManager.removePlayer(player);
    }
    async doTick(tick: number){

    }

}
