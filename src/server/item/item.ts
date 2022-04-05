import type { Shortcut } from "../container/shortcut";
import type { World } from "../land/world";
import type { Server } from "../server";
import type { ItemType } from "./item-type";

export abstract class Item{
    protected server: Server;
    protected world: World;
    constructor(protected shortcut: Shortcut) {
        this.server = this.shortcut.getServer();
        this.world = this.server.getWorld();
    }

    abstract getType() : ItemType;
    abstract hold(): void;
    abstract unhold(): void;
}