import * as PIXI from "pixi.js";
import { Vector2 } from "../../server/shared/math";

import { doTickable } from "../../shared/update";
import { TextureManager } from "../texture";

export interface IGameObject extends doTickable,PIXI.DisplayObject{ 
    getObjectId(): string;
    setMoveTarget(target: Vector2):void;
    doTick(tick:number):Promise<void>;
}

export enum GameObjectEvent{
    MoveActorEvent = "MoveActorEvent"
}

export function BuildGameObjectHash(item:string | IGameObject) : string{
    if(typeof item == "string")
        return `gameobject.id.${item}`;
    
    return BuildGameObjectHash(item.getObjectId());
}
export class SpriteGameObject extends PIXI.Sprite implements IGameObject{

    /**
     * 一旦该状态被设置,
     * 
     * 则实体会一直拥有向该点的趋势,
     * 并在到达该点后取消设置
     */
    private moveTarget : Vector2 | undefined;

    /**
     * 设置该状态后,实体会自动过渡到目标位置
     */
    protected smoothMove = true;

    constructor(
        protected textureManager : TextureManager,
        protected objectId:string,
        size:Vector2,
        loc:Vector2,
    ){
        super();
        this.position.set(loc.x,loc.y);
        this.width = size.x;
        this.height = size.y;
        
    }
    setSmoothMove(smooth : boolean){
        this.smoothMove = smooth;
    }
    getLocation(){
        return new Vector2(this.position.x,this.position.y);
    }
    getObjectId(){
        return this.objectId;
    }
    setMoveTarget(target : Vector2){
        this.moveTarget = target;
    }
    private doMoveTargetTick(){

        if(this.moveTarget && this.smoothMove == false){
            if(this.moveTarget.distanceTo(this.getLocation()) > 0.5)
                this.position.set(this.moveTarget.x,this.moveTarget.y);

            this.moveTarget = undefined;
            
            return;
        }

        if(this.moveTarget){
            
            const dx = this.moveTarget.x - this.x;
            const dy = this.moveTarget.y - this.y;

            const dis = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
            
            if(dis <=  0.001){
                this.position.set(this.moveTarget.x,this.moveTarget.y);
                this.moveTarget = undefined;
                return;
            }


            const deltaX = dx * 0.1;
            const deltaY = dy * 0.1;

            this.position.set(this.x + deltaX ,this.y + deltaY);    


        
        }
    }
    async doTick(tick:number){
        this.doMoveTargetTick();
    }
    
}