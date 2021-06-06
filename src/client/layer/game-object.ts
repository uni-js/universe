import * as PIXI from "pixi.js";

import { ActorType } from "../../server/layer/entity";
import { Vector2 } from "../../server/shared/math";
import { Direction, WalkingState } from "../../shared/actor";

import { doTickable } from "../../shared/update";
import { TextureManager,GetEmptyTexture } from "../texture";


export interface IGameObject extends doTickable,PIXI.DisplayObject{ 
    getObjectId(): string;
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

export class StaticObject extends PIXI.Sprite implements IGameObject{
    constructor(
        protected textureManager : TextureManager,
        protected objectId:string,
        size:Vector2,
        loc:Vector2
    ){
        super();
        this.position.set(loc.x,loc.y);
        this.width = size.x;
        this.height = size.y;
    }
    async doTick(tick: number){
        
    }
    getLocation(){
        return new Vector2(this.position.x,this.position.y);
    }
    getObjectId(){
        return this.objectId;
    }

}


export class ActorObject extends PIXI.Container implements IGameObject{

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


        this.setTagName(this.tagname);

        this.addChildAt(this.nametag,0);
        this.addChildAt(this.sprite,1);
        this.addChildAt(this.shadow,2);
        
        this.setDirection(Direction.FORWARD);

        this.setLocation(loc);
        this.resize();


        this.lastLoc = this.loc.clone();
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
    }
    setAnimateSpeed(speed : number){
        this.sprite.animationSpeed = speed;
    }
    stopAnim(){
        if(!this.playing)return;

        this.sprite.stop();
        this.resetAnim();
        this.playing = false;
        console.log("stop");
    }
    playAnim(){
        if(this.playing)return;

        this.sprite.play();
        console.log("play",this.sprite.textures);
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
                this.setLocation(this.moveTarget);

            this.moveTarget = undefined;
            
            return;
        }

        if(this.moveTarget){
            
            const dx = this.moveTarget.x - this.x;
            const dy = this.moveTarget.y - this.y;

            const dis = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2))
            
            if(dis <=  0.001){
                this.setLocation(this.moveTarget);
                this.moveTarget = undefined;
                return;
            }


            const deltaX = dx * 0.1;
            const deltaY = dy * 0.1;

            this.setLocation(new Vector2(this.x + deltaX ,this.y + deltaY));    

        
        }

    }

    async doTick(tick:number){
        this.doMoveTargetTick();

        this.lastLoc = this.loc.clone();
    }
    
}