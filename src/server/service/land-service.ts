
import { EventBus } from "../../event/bus-server";
import { AddLandEvent, RemoveLandEvent } from "../../event/server-side";
import { Land } from "../entity/land";
import { Player, PlayerEvent } from "../entity/player";
import { Service } from "../shared/service";
import { PlayerManager } from "../manager/player-manager";
import { inject, injectable } from "inversify";

@injectable()
export class LandService implements Service{
    constructor(
        @inject(EventBus) private eventBus:EventBus,
        @inject(PlayerManager) private playerManager : PlayerManager
    ){
        this.playerManager.on(PlayerEvent.LandUsedEvent,this.onLandUsedEvent);
        this.playerManager.on(PlayerEvent.LandNeverUsedEvent,this.onLandNeverUsedEvent);
        
    }
    private onLandUsedEvent = (land : Land,player : Player)=>{
        const landLoc = land.getLandLoc();

        const event = new AddLandEvent(land.getEntityId(),landLoc.x,landLoc.y,land.getLandData());
        this.eventBus.emitTo([player.getConnId()],event);
    }
    private onLandNeverUsedEvent = (land : Land,player : Player)=>{
        const landLoc = land.getLandLoc();

        const event = new RemoveLandEvent(land.getEntityId(),landLoc.x,landLoc.y);
        this.eventBus.emitTo([player.getConnId()],event);
    }
    async doTick(tick: number): Promise<void> {

    }

}