import { BILLION_VALUE, Vector2 } from "../../server/shared/math";
import { TextureManager } from "../texture";
import { ActorObject, GameObjectEvent } from "../layer/game-object";
import { ActorType } from "../../server/layer/entity";
import { ParticleObject } from "../particle";
import { Direction, WalkingState } from "../../shared/actor";

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

    constructor(
        textureManager : TextureManager,
        objectId:string,
        loc: Vector2,
        playerName:string
    ){
        super(ActorType.PLAYER,textureManager,objectId,new Vector2(1,1.5),loc,playerName);


        this.setAnchor(0.5,1);
        this.setAnimateSpeed(0.12);
        this.setWalking(WalkingState.SILENT);
        
    }
    setTakeControl(){
        this.takeControl = true;
        this.smoothMove = false;
    }
    setDirection(direction : Direction,emit = true){
        if(this.direction == direction)return;

        const textures = this.getDirectionTextures(direction);
        textures.push(textures.shift()!);

        this.setTextures(textures);
        this.direction = direction;
        this.setWalking(WalkingState.SILENT,emit);

        this.emit(GameObjectEvent.SetActorStateEvent,this);
    }

    controlMove(delta:Vector2){
        if(!this.controlMoved){
            this.controlMoved = { moved: delta, startAt:this.getWorldLoc() };
        }
        else{
            this.controlMoved.moved = this.controlMoved.moved.add(delta);
        }

        if(this.controlMoved){
            const delta = this.controlMoved.moved;
    
            if(delta.y > 0){
                this.setDirection(Direction.FORWARD);
            }else if(delta.y < 0 ){
                this.setDirection(Direction.BACK);
            }else if(delta.x > 0 ){
                this.setDirection(Direction.RIGHT);
            }else if(delta.x < 0 ){
                this.setDirection(Direction.LEFT);
            }
        }

    }
    private doControlMoveTick(tick:number){

        if(this.controlMoved){
            const target = this.controlMoved.startAt.add(this.controlMoved.moved);
            this.setLocation(target);
            this.setWalking(WalkingState.WALKING);
        }
        if(!this.controlMoved){
            if(this.takeControl){
                this.setWalking(WalkingState.SILENT);
            }
        }

        if(this.controlMoved && tick % 2 == 0){

            this.emit(PlayerObjectEvent.ControlMovedEvent,this.controlMoved.moved,this.direction,this.walking);
            this.controlMoved = undefined;
        }

    }
    private doOrderTick(){
        this.zIndex = 2 + (this.y / BILLION_VALUE + 1) / 2;
    }
    async doTick(tick:number) {
        super.doTick.call(this,tick);

        this.doControlMoveTick(tick);
        this.doOrderTick();
    }

}
