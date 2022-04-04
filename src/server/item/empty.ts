import { Item } from "./item";
import { ItemType } from "./item-type";

export class EmptyItem extends Item{
    getType(): ItemType {
        return ItemType.EMPTY;
    }
}