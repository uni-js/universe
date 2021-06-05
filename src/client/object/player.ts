import * as PIXI from "pixi.js";
import { Vector2 } from "../../server/shared/math";
import { TextureManager } from "../texture";
import { ActorObject, Direction } from "../layer/game-object";
import { AnimatedSprite, DisplayObject } from "pixi.js";
import { ActorType } from "../../server/layer/entity";

export enum WalkingState{
    SILENT = "silent",
    WALKING = "walking",
    RUNNING = "running"
}

export interface ControlMoved{
    moved : Vector2;
    startAt : Vector2;
}
export enum PlayerObjectEvent{
    ControlMovedEvent = "ControlMovedEvent"
}
export class Player extends ActorObject{
    private controlMoved : ControlMoved | undefined;
    private takeControl : boolean = false;
    private walking = WalkingState.SILENT;

    constructor(
        textureManager : TextureManager,
        objectId:string,
        loc: Vector2,
        playerName:string
    ){
        super(ActorType.PLAYER,textureManager,objectId,new Vector2(1,1.5),loc,playerName);

        this.zIndex = 2;
        this.setAnchor(0.5,1);
        this.setAnimateSpeed(0.1);
        this.setWalking(WalkingState.SILENT);
        
    }
    setTakeControl(){
        this.takeControl = true;
        this.smoothMove = false;
        this.zIndex = 3;
    }
    setDirection(direction : Direction){
        if(this.direction == direction)return;

        this.setTextures(this.getDirectionTextures(direction));
        this.direction = direction;
        this.setWalking(WalkingState.SILENT);
        
    }

    setWalking(walking : WalkingState){
        this.walking = walking;
        if(walking == WalkingState.SILENT){
            this.stopAnim();
        }else if(walking == WalkingState.RUNNING){
            this.playAnim();
        }else if(walking == WalkingState.WALKING){
            this.playAnim();
        }
    }
    controlMove(delta:Vector2){
        if(!this.controlMoved){
            this.controlMoved = { moved: delta, startAt:this.getLocation() };
        }
        else{
            this.controlMoved.moved = this.controlMoved.moved.add(delta);
        }
    }
    private doControlMoveTick(tick:number){

        if(this.controlMoved){
            const target = this.controlMoved.startAt.add(this.controlMoved.moved);
            this.setLocation(target);
            this.setWalking(WalkingState.WALKING);
        }else{
            this.setWalking(WalkingState.SILENT);
        }

        if(this.controlMoved && tick % 2 == 0){
            this.emit(PlayerObjectEvent.ControlMovedEvent,this.controlMoved.moved);
            this.controlMoved = undefined;
        }

    }
    async doTick(tick:number) {
        super.doTick.call(this,tick);

        this.doControlMoveTick(tick);
    }

}
