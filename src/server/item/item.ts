import type { ItemType } from "./item-type";

export abstract class Item{
    abstract getType() : ItemType;
}