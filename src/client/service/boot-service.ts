import { inject, injectable } from "inversify";
import { EventBusClient } from "../../event/bus-client";
import { LoginEvent } from "../../event/client-side";

@injectable()
export class BootService{
    constructor(@inject(EventBusClient) private eventBus : EventBusClient){

        this.startGame();
    }
    startGame(){
        this.eventBus.emitEvent(new LoginEvent());

    }
    
}