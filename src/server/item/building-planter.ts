import { Tree } from "../building/tree";
import { Item } from "./item";
import { ItemType } from "./item-type";

export class BuildingPlanter extends Item {
    getType(): ItemType {
        return ItemType.DEBUG_BUILDING_PLANTER;
    }
    stopUsing(): void {
        const player = this.shortcut.getPlayer();
        const building = new Tree(this.server, player.getPos(), 0);
        this.world.addBuilding(building);
    }

}