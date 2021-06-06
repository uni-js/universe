import { Vector2 } from "../../server/shared/math";
import { TextureManager } from "../texture";
import { ActorObject } from "../layer/game-object";
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
    private footArticle;

    constructor(
        textureManager : TextureManager,
        objectId:string,
        loc: Vector2,
        playerName:string
    ){
        super(ActorType.PLAYER,textureManager,objectId,new Vector2(1,1.5),loc,playerName);

        this.footArticle = new ParticleObject("black",1,10,0.2,0.2);
        this.addChild(this.footArticle);

        this.zIndex = 2;
        this.setAnchor(0.5,1);
        this.setAnimateSpeed(0.12);
        this.setWalking(WalkingState.SILENT);
        
    }
    setWalking(walking : WalkingState,emit = true){
        if(this.walking == walking) return;
        super.setWalking(walking);

        if(emit)
           this.emit(PlayerObjectEvent.ControlMovedEvent,new Vector2(0,0),this.direction,this.walking);

    }
    setTakeControl(){
        this.takeControl = true;
        this.smoothMove = false;
        this.zIndex = 3;
    }
    setDirection(direction : Direction,emit = true){
        if(this.direction == direction)return;

        const textures = this.getDirectionTextures(direction);
        textures.push(textures.shift()!);

        this.setTextures(textures);
        this.direction = direction;
        this.setWalking(WalkingState.SILENT,emit);
    }

    controlMove(delta:Vector2){
        if(!this.controlMoved){
            this.controlMoved = { moved: delta, startAt:this.getLocation() };
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
    async doTick(tick:number) {
        super.doTick.call(this,tick);

        this.doControlMoveTick(tick);
    }

}
