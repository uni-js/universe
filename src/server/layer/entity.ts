import { doTickable } from "../../shared/update";
import { GetUniqueId, Vector2 } from "../shared/math";
import { EventEmitter } from "../shared/event";
import { LAND_WIDTH } from "../land/const";


export const MOVEMENT_TICK_MIN_DISTANCE = 0.01;

export function LocToLandLoc(loc:Vector2){
    const landLoc = loc.divFloor(LAND_WIDTH);
    return landLoc;
}
export function LandLocToLoc(landLoc:Vector2){
    const loc = landLoc.mul(LAND_WIDTH);
    return loc;
}


export function BuildActorHash(item:string | Actor) : string{
    if(typeof item == "string")
        return `actor.id.${item}`;
    
    return BuildActorHash(item.getActorId());
}


export enum ActorEvent{
    NewPosEvent = "NewPosEvent",
    AddActorEvent = "AddActorEvent",
    RemoveActorEvent = "RemoveActorEvent",
    LandMoveEvent = "LandMoveEvent"
}

export interface IEntity extends doTickable,EventEmitter{ }

export abstract class Entity extends EventEmitter implements IEntity{
    protected entityId : string;
    constructor(){
        super();
        this.entityId = GetUniqueId();
    }
    getEntityId(){
        return this.entityId;
    }
    abstract doTick(tick: number): Promise<void>;
}

export enum ActorType{
    NONE = "none",
    HUMAN = "human",
    PLAYER = "player"
}
export class Actor extends Entity{

    /**
     * 用于序列化的Actor类型名
     */
    static ENTITY_TYPE = "Actor";

    protected loc : Vector2;
    protected motion : Vector2 = new Vector2(0, 0);
    protected type : ActorType;

    private lastLoc : Vector2;
    private lastEmitLoc : Vector2;

    constructor(loc : Vector2,type : ActorType){
        super();
        this.loc = loc;
        this.lastLoc = loc;
        this.lastEmitLoc = loc;

        this.type = type;
        
    }
    private getLastLandAt(){
        return LocToLandLoc(this.lastLoc);
    }
    getType(){
        return this.type;
    }
    getLandAt(){
        return LocToLandLoc(this.loc);
    }
    getActorId(){
        return this.entityId;
    }

    /**
     * 获取Actor在3D世界的位置
     */
    getLocation(){
        return this.loc;
    }
    getMotion(){
        return this.motion;
    }
    setMotion(motion:Vector2){
        this.motion = motion;
    }
    /**
     * 强制设置位置坐标
     */
    setLocation(target_loc:Vector2){
        this.loc = target_loc;

    }

    teleport(target_loc:Vector2){
        this.setLocation(target_loc);
    }
    moveDelta(delta:Vector2){
        this.loc.x += delta.x;
        this.loc.y += delta.y;
    }

    async doTick(tick : number){
        this.doMovementTick();

    }
    private doEmitMoveTick(){
        const delta = Vector2.getVectorDelta(this.loc,this.lastEmitLoc);
        if(delta.getSqrt() >= MOVEMENT_TICK_MIN_DISTANCE){
            this.emit(ActorEvent.NewPosEvent,this);
            this.lastEmitLoc = this.loc.clone();
            return;
        }
    }
    private doLandMoveTick(){
        if(this.getLandAt().equals(this.getLastLandAt()))
            return;
    
        this.emit(ActorEvent.LandMoveEvent,this,this.getLandAt(),this.getLastLandAt());
    }
    private doMovementTick(){
        this.loc = this.loc.add(this.motion);

        this.doEmitMoveTick();
        this.doLandMoveTick();

        this.lastLoc = this.loc.clone();

    }

}

