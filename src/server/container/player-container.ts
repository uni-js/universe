import { Item } from "../item/item";
import type { Player } from "../player/player";
import type { Server } from "../server";
import { Container } from "./container";

export abstract class PlayerContainer extends Container{
    private player: Player;
    constructor(player: Player, server: Server) {
        super(server);
        
        this.player = player;
    }

    abstract getSize(): number;

    setItem(index: number, item: Item, count: number): void {
        super.setItem(index, item, count);
        this.syncBlock(this.player, this.getBlock(index));
    }
}