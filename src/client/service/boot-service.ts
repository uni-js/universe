import { EventBusClient } from "../../event/bus-client";
import { LoginEvent } from "../../event/client-side";

export class BootService{
    constructor(private eventBus : EventBusClient){

        this.startGame();
    }
    startGame(){
        this.eventBus.emitEvent(new LoginEvent());

    }
    
}