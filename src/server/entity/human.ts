import { Vector2 } from "../shared/math";
import { Actor, ActorType } from "../layer/entity";

export class Human extends Actor{
    static ENTITY_TYPE = "Human";

    constructor(loc:Vector2){
        super(loc, ActorType.HUMAN );

    }

}
