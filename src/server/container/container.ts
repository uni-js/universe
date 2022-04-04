import { SetContainerDataEvent, SetItemEvent } from "../event/server";
import { EmptyItem } from "../item/empty";
import type { Item } from "../item/item";
import { ItemType } from "../item/item-type";
import type { Player } from "../player/player";
import type { Server } from "../server";

const BLOCK_MAX_SIZE = 64;

export interface ContainerDataUnit {
	index: number;
	itemType: ItemType;
	count: number;
}

export interface ContainerData {
    units: ContainerDataUnit[]
}


export class ContainerBlock {
    private emptyItem = new EmptyItem();
    private store: Item = this.emptyItem;
    private count: number = 0;
    private maxSize = BLOCK_MAX_SIZE;

    setItem(item: Item, count: number) {
        if (count <= 0 || count > this.maxSize) {
            return;
        }
        this.store = item;
    }

    getSpareSize() {
        return this.maxSize - this.count;
    }

    getItem() {
        return this.store;
    }

    getCount() {
        return this.count;
    }

    clear() {
        this.store = this.emptyItem;
        this.count = 0;
    }

    isEmpty() {
        return this.store.getType() === ItemType.EMPTY;
    }
}

export abstract class Container{
    static idSum = 0;
    
    protected id = 0;
    protected usedSize: number = 0;
    protected blocks: ContainerBlock[] = [];

    constructor(private server: Server) {
        this.id = Container.idSum ++;

        for(let i=0;i<this.getSize();i++){
            this.blocks.push(new ContainerBlock());
        }
    }

    abstract getSize(): number;

    getId() {
        return this.id;
    }

    isEmpty() {
        return this.usedSize === 0;
    }

    isFull() {
        return this.getSpareSize() === 0;
    }

    getSpareSize() {
        return this.getSize() - this.usedSize;
    }

    isBlockEmpty(index: number) {
        return this.blocks[index].isEmpty();
    }

    getItem(index: number): Item | undefined {
        return this.blocks[index].getItem();
    }

    getBlock(index: number) {
        return this.blocks[index];
    }

    protected syncContainer(player: Player) {
        const data: ContainerData =  {
            units: []
        }
        this.blocks.forEach((block, index) => {
            data.units.push({
                itemType: block.getItem().getType(),
                count: block.getCount(),
                index
            })
        })

        const event = new SetContainerDataEvent();
        event.data = data;

        player.emitEvent(event);
    }

    protected syncBlock(player: Player, block: ContainerBlock) {
        const event = new SetItemEvent();
        event.contId = this.getId();
        event.count = block.getCount();
        event.itemType = block.getItem().getType();

        player.emitEvent(event);
    }

    setItem(index: number, item: Item, count: number): void {
        if (this.isBlockEmpty(index) && item !== undefined) {
            this.usedSize += 1;
        }
        const block = this.blocks[index];
        block.setItem(item, count);
    }

    clearItem(index: number): void{
        if (!this.isBlockEmpty(index)) {
            this.usedSize -= 1;
        }
        this.blocks[index].clear();
    }

    moveTo(index: number, to: Container, toIndex: number) {
        if (this.isBlockEmpty(index)) {
            return;
        }

        if (!to.isBlockEmpty(toIndex)) {
            return;
        }

        const item = this.getItem(index);
        to.setItem(toIndex, item, this.blocks[index].getCount());
        this.clearItem(index);

    }
}