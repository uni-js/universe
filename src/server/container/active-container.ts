import { Container, ContainerBlock, ContainerData } from "./container";
import type { Server } from "../server";
import { SetContainerDataEvent, SetItemEvent } from "../event/server";
import { Player } from "../player/player";

export abstract class ActiveContainer extends Container{
    static idSum = 0;
    private id: number;
    constructor(server: Server) {
        super(server);
        this.id = ActiveContainer.idSum++;
    }

    abstract getSize(): number;

    syncContainerTo(player: Player) {
        const data: ContainerData =  {
            units: []
        }
        this.blocks.forEach((block, index) => {
            data.units.push({
                itemType: block.getItemType(),
                count: block.getCount(),
                index
            })
        })

        const event = new SetContainerDataEvent();
        event.contId = this.getId();
        event.contType = this.getType();
        event.data = data;

        player.emitEvent(event);
    }

    syncBlockTo(player: Player, block: ContainerBlock | number) {
        const event = new SetItemEvent();
        event.contId = this.getId();
        event.contType = this.getType();
        
        if(typeof(block) === "number") {
            block = this.getBlock(block);
        }

        event.count = block.getCount();
        event.itemType = block.getItemType();

        player.emitEvent(event);
    }

    getId() {
        return this.id;
    }
    
}