import { BrickType } from "../land/types";
import { Entity } from "../layer/entity";
import { Vector2 } from "../shared/math";


export function BuildBrickOffsetHash(item : Vector2 | Brick) : string{
    if(item instanceof Vector2)
        return `brick.off.${item.x}#${item.y}`;
    
    return BuildBrickOffsetHash(item.getOffsetLoc());
}

export class Brick extends Entity{
    private offLoc : Vector2;
    protected type : BrickType;
    constructor(offLoc : Vector2,type : BrickType){
        super();
        this.offLoc = offLoc;
        this.type = type;
    }
    getType(){
        return this.type;
    }
    getOffsetLoc(){
        return this.offLoc;
    }

    async doTick(tick: number) {
        
    }
}