import { UseItemInstruction } from "./instruction";

export enum ItemType{
    /**
     * 原木
     */
    OAK = "oak",

}

export interface Item{
    getType() : ItemType;
    use() : UseItemInstruction[];
}
