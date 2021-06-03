import * as THREE from "three";
import { SpriteMaterial } from "three";
import { Vector2 } from "../../server/shared/math";
import { TextureManager } from "../texture";
import { BuildGameObjectHash, SpriteGameObject } from "../layer/game-object";

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
export class Player extends SpriteGameObject{
    private controlMoved : ControlMoved | undefined;
    private takeControl : boolean = false;

    private walking = WalkingState.SILENT;
    constructor(
        textureManager : TextureManager,
        objectId:string,
        loc: Vector2,
        ){
        super(textureManager,objectId,new Vector2(1,2),loc);
        this.zIndex = 2;      
        
        this.setWalking(WalkingState.SILENT);
        
    }
    setTakeControl(){
        this.takeControl = true;
        this.smoothMove = false;
        this.zIndex = 3;
    }

    setWalking(walking : WalkingState){
        this.walking = walking;
        this.texture = this.textureManager.get(`player.walking.${walking}`)!;
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
            this.position.set(target.x,target.y);
            
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
