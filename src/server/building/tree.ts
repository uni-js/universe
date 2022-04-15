import { Vector2 } from "../utils/vector2"
import { Building } from "./building"
import { BuildingType } from "./building-type"

export class Tree extends Building{
    getSize(): Vector2 {
        return new Vector2(3, 3);
    }
    getType() {
        return BuildingType.TREE
    }
}