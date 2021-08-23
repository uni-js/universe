import { IndexedStore } from "../../shared/store";
import { Player, PlayerEvent } from "../entity/player";
import { BuildInventoryHash, Inventory, PlayerInventory } from "../entity/inventory";
import { BuildActorHash } from "../shared/entity";
import { PlayerManager } from "./player-manager";

export class InventoryManager{
    constructor(
        private inventoryStore : IndexedStore<Inventory>,
        private playerManager : PlayerManager
    ){
        this.playerManager.on(PlayerEvent.PlayerAddedEvent,this.onPlayerAdded);
        this.playerManager.on(PlayerEvent.PlayerRemovedEvent,this.onPlayerRemoved);
    }
    private onPlayerAdded = (player : Player)=>{
        const shortcut = new PlayerInventory(player.getActorId());
        this.inventoryStore.add(shortcut)
    }
    private onPlayerRemoved = (player : Player)=>{
        const shortcut = this.inventoryStore.get(BuildActorHash(player))!;
        this.inventoryStore.remove(shortcut);
    }
    getPlayerInventory(player : Player){
        return this.inventoryStore.get(BuildActorHash(player));
    }
    getInventory(inventoryId:string){
        return this.inventoryStore.get(BuildInventoryHash(inventoryId));
    }
    
}