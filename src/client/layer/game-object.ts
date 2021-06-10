import { EventEmitter2 } from "eventemitter2";
import * as PIXI from "pixi.js";

import { ActorType } from "../../server/layer/entity";
import { Interpolate2d, Vector2 } from "../../server/shared/math";
import { Direction, WalkingState } from "../../shared/actor";

import { doTickable } from "../../shared/update";
import { TextureManager,GetEmptyTexture } from "../texture";


export interface IGameObject extends doTickable,PIXI.DisplayObject{ 
    getObjectId(): string;
    doTick(tick:number):Promise<void>;
}

export enum GameObjectEvent{
    MoveActorEvent = "MoveActorEvent",
    SetActorStateEvent = "SetActorStateEvent"
}

export function BuildGameObjectHash(item:string | IGameObject) : string{
    if(typeof item == "string")
        return `gameobject.id.${item}`;
    
    return BuildGameObjectHash(item.getObjectId());
}

export class StaticObject extends PIXI.Container implements IGameObject{
    protected sprite : PIXI.Sprite;

    constructor(
        protected textureManager : TextureManager,
        protected objectId:string,
        size:Vector2,
        relativeLoc:Vector2,
        protected worldLoc:Vector2
    ){
        super();

        this.sprite = new PIXI.Sprite();

        this.position.set(relativeLoc.x,relativeLoc.y);
        this.sprite.width = size.x;
        this.sprite.height = size.y;


        this.addChild(this.sprite);
    }
    async doTick(tick: number){
        
    }
    getWorldLoc(){
        return this.worldLoc;
    }
    getRelativeLoc(){
        return new Vector2(this.position.x,this.position.y);
    }
    getObjectId(){
        return this.objectId;
    }

}
export interface MoveTargetTask{
    enable : boolean,
    tick : number,
    points : Vector2[]
}

/**
 * 用于平滑处理移动同步包
 */
export class MoveInterpolator extends EventEmitter2{

    /**
     * 缓存的目标点
     * 
     */
     private movePoints : Vector2[] = [];

     private moveTargetTask : MoveTargetTask = {
         enable : false,
         tick : 0,
         points: []
     };

    constructor(private maxTick : number){
        super();
    }

    addMovePoint(target : Vector2){
        this.movePoints.push(target);
        if(this.movePoints.length > 20){
            this.movePoints.shift();
        }
    }
    setMoveTarget(count : number,bufCount : number){
        this.moveTargetTask = {
            enable:true,
            points:this.movePoints.slice(0,count),
            tick:Math.round(bufCount * this.maxTick / count)
        }
        this.movePoints.splice(0,count - bufCount);
    }
    doTick(){        
        if(!this.moveTargetTask.enable){
            if(this.movePoints.length>=3)
                this.setMoveTarget(3,2);
                
        }
        if(this.moveTargetTask.enable){
            const point = Interpolate2d(this.moveTargetTask.points,this.moveTargetTask.tick/this.maxTick);
            this.emit("location",point);

            if(this.moveTargetTask.tick >= this.maxTick){
                this.moveTargetTask.enable = false;

            }

            this.moveTargetTask.tick ++;
        }
       
    }
    
}

export function BuildActorObjectHash(item : ActorObject | string){
    if(typeof(item) == "string")
        return `actorobject.id.${item}`;

    return `actorobject.id.${item.getObjectId()}`;
}

export class ActorObject extends PIXI.Container implements IGameObject{


    private moveInterpolator;
    /**
     * 设置该状态后,实体会自动过渡到目标位置
     */
    protected smoothMove = true;
    private hasBaseStateChanged = true;

    protected shadow;
    protected sprite;
    protected nametag : PIXI.Text;

    private lastLoc : Vector2;

    protected direction : Direction = Direction.BACK;
    protected walking : WalkingState = WalkingState.SILENT;

    private usedTextures : PIXI.Texture[] = [];
    private playing = false;

    constructor(
        protected actorType : ActorType,
        protected textureManager : TextureManager,
        protected objectId:string,
        protected size:Vector2,
        private loc:Vector2,
        private tagname:string,
    ){
        super()
        

        this.sprite = new PIXI.AnimatedSprite([GetEmptyTexture()]);

        this.usedTextures = this.textureManager.get(`actor.${this.actorType}`)!;
        this.shadow = new PIXI.Sprite(this.textureManager.getOne("system.shadow")!);

        this.nametag = new PIXI.Text("");
        this.nametag.style = new PIXI.TextStyle({
            fill:"white"
        })

        this.moveInterpolator = new MoveInterpolator(6);
        this.moveInterpolator.on("location",this.handleInterpolatedLocation.bind(this))

        this.setTagName(this.tagname);

        this.addChildAt(this.nametag,0);
        this.addChildAt(this.sprite,1);
        this.addChildAt(this.shadow,2);
        
        this.setDirection(Direction.FORWARD);

        this.setLocation(loc);
        this.resize();


        this.lastLoc = this.loc.clone();
    }
    private handleInterpolatedLocation(loc : Vector2){
        this.setLocation(loc);
    }
    getWalking(){
        return this.walking;
    }
    getDirection(){
        return this.direction;
    }
    setWalking(walking : WalkingState,emit = true){
        if(this.walking == walking)return;

        this.walking = walking;
        if(walking == WalkingState.SILENT){
            this.stopAnim();
        }else if(walking == WalkingState.RUNNING){
            this.playAnim();
        }else if(walking == WalkingState.WALKING){
            this.playAnim();
        }

        if(emit)
            this.hasBaseStateChanged = true;

    }
    setAnimateSpeed(speed : number){
        this.sprite.animationSpeed = speed;
    }
    stopAnim(){
        if(!this.playing)return;

        this.sprite.stop();
        this.resetAnim();
        this.playing = false;
    }
    playAnim(){
        if(this.playing)return;

        this.sprite.play();
        this.playing = true;
    }
    resetAnim(){
        this.sprite.gotoAndStop(0);
    }

    setLocation(location : Vector2){
        this.loc = location.clone();
        this.position.set(this.loc.x,this.loc.y);
    }
    setDirection(direction : Direction,emit = true){
        this.direction = direction;

        if(emit)
            this.hasBaseStateChanged = true;
    }
    protected getDirectionTextures(dir : Direction){
        if(dir == Direction.FORWARD){
            return this.usedTextures.slice(0,3);
        }else if(dir == Direction.LEFT){
            return this.usedTextures.slice(3,6);
        }else if(dir == Direction.RIGHT){
            return this.usedTextures.slice(6,9);
        }else if(dir == Direction.BACK){
            return this.usedTextures.slice(9,12);            
        }else return [];
    }

    setTagName(tagname:string){
        this.tagname = tagname;
        this.nametag.text = this.tagname;
    }
    private resize(){

        this.sprite.width=this.size.x;
        this.sprite.height=this.size.y;
        
        const shadowBounds = this.shadow.getLocalBounds();
        const shadowRatio = shadowBounds.height / shadowBounds.width;

        this.shadow.width= this.size.x;
        this.shadow.height= this.size.x * shadowRatio;
        this.shadow.position.set(0,-0.15);

        const nametagBounds = this.nametag.getBounds();
        const nametagRatio = nametagBounds.height / nametagBounds.width;

        this.nametag.width = 0.5 / nametagRatio;
        this.nametag.height = 0.5;

        this.nametag.position.set(0,-this.size.y-0.3);

    }
    setAnchor(x:number,y:number){
        this.sprite.anchor.set(x,y);
        this.shadow.anchor.set(0.5,0.5);        
        this.nametag.anchor.set(0.5,0.5);
    }
    setTextures(textures : PIXI.Texture[]){
        this.sprite.textures = textures;

        this.resize();

    }
    setSmoothMove(smooth : boolean){
        this.smoothMove = smooth;
    }
    getWorldLoc(){
        return this.loc;
    }
    getRelativeLoc(){
        return new Vector2(this.position.x,this.position.y);
    }
    getObjectId(){
        return this.objectId;
    }
    addMovePoint(point : Vector2){
        this.moveInterpolator.addMovePoint(point);
    }
    async doTick(tick:number){
        this.moveInterpolator.doTick();
        if(this.hasBaseStateChanged){
            this.emit(GameObjectEvent.SetActorStateEvent,this);
            this.hasBaseStateChanged = false;
        }

        this.lastLoc = this.loc.clone();
    }
    
}