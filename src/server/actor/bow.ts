import { Actor } from "./actor";
import { Vector2 } from "../utils/vector2";
import { ActorType } from "./actor-type";

export class Bow extends Actor{

    getType(): number {
        return ActorType.BOW;
    }

    getSize() {
        return new Vector2(0.65, 0.65);
    }
    
    endUsing(): void {
        super.endUsing();
        if (this.useTicks > 20) {

        }
    }

}