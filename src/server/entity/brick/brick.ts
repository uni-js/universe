import { BrickType } from "./types";
import { Entity } from "../../layer/entity";
import { Vector2 } from "../../shared/math";
import { Factory } from "../../shared/factory";


export function BuildBrickOffsetHash(item : Vector2 | Brick) : string{
    if(item instanceof Vector2)
        return `brick.off.${item.x}#${item.y}`;
    
    return BuildBrickOffsetHash(item.getOffsetLoc());
}

export class Brick extends Entity{
    static brickType : BrickType;

    private offLoc : Vector2;
    private broken : boolean = false;
    constructor(offLoc : Vector2){
        super();
        this.offLoc = offLoc;
    }
    setBroken(broken : boolean){
        this.broken = broken;
    }
    isBroken(){
        return this.broken;
    }
    getType() : BrickType{
        return (this.constructor as any).brickType;
    }
    getOffsetLoc(){
        return this.offLoc;
    }

    async doTick(tick: number) {
        
    }
}

export class BrickFactory extends Factory<BrickType,Brick>{ }
