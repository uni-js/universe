import { Entity } from "../../shared/entity";
import { GetUniqueId } from "../../shared/math";
import { Item } from "../item/item";

export function BuildInventoryHash(item : Inventory | string) : string{
    if(typeof(item) == "string")
        return `inventory.id.${item}`;
    return BuildInventoryHash(item.getId());
}

export type Block = Item | undefined;
export class Inventory extends Entity{
    private id : string;
    private blocks : Block[];
    constructor(
        private size : number
    ){
        super();
        this.blocks = new Array(this.size);
        this.id = GetUniqueId();
    }
    getSize(){
        return this.size;
    }
    getId(){
        return this.id;
    }
    setItem(index:number,item : Item | undefined){
        this.blocks[index] = item;
    }
    getItem(index:number){
        return this.blocks[index];
    }
    async doTick(tick: number){
        
    }
}

export class PlayerInventory extends Inventory{
    private shortcutSize = 5;
    private shortcutCurrentIndex = 0;

    constructor(private playerId : string){
        super(20);

    }
    setShortcutItem(index:number,item : Item | undefined){
        const offset = this.getSize() - this.shortcutSize;
        this.setItem(offset + index,item);
    }
    setShortcutIndex(index:number){
        this.shortcutCurrentIndex = index;
    }
    getShortcutIndex(){
        return this.shortcutCurrentIndex;
    }
    getPlayerId(){
        return this.playerId;
    }
    async doTick(tick: number): Promise<void> {
        
    }
    
}