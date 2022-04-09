import { Vector2 } from "../utils/vector2";
import { Actor } from "./actor";
import { ActorType } from "./actor-type";

export class DroppedItemActor extends Actor {
    getSize(): Vector2 {
        return new Vector2(0.5, 0.5);
    }
    getType(): number {
        return ActorType.DROPPED_ITEM;
    }
    getItemType() {
        return this.buildData.itemType;
    }
    getItemCount() {
        return this.buildData.itemCount;
    }
    protected updateAttrs(): void {
        super.updateAttrs();
        this.attrs.set('itemType', this.buildData.itemType);
        this.attrs.set('itemCount', this.buildData.itemCount);
    }
}