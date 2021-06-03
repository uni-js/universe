import { IndexedStore } from "../../shared/store";
import { BrickData, LandData } from "../land/types";
import { Actor, Entity, LocToLandLoc } from "../layer/entity";
import { Vector2 } from "../shared/math";
import { Brick, BuildBrickOffsetHash } from "./brick";


export function BuildLandHash(item:Vector2 | Land) : string{
    if(item instanceof Vector2)
        return `land.loc.${item.x}#${item.y}`;
    return BuildLandHash(item.getLandLoc());
}

/**
 * 计算并获取某个坐标点
 * 附近半径的所有区块坐标
 * 
 * @returns 区块坐标数组
 */
export function GetRadiusLands(loc:Vector2,radius:number):Vector2[]{

    const landLoc = LocToLandLoc(loc);
    const landLocs : Vector2[] = [];
    
    for(let dx=0;dx<radius;dx++)
        for(let dy=0;dy<radius;dy++)
        {
            if(dx == 0 && dy == 0)
                continue;

            landLocs.push(landLoc.add(new Vector2(dx,dy)));
            landLocs.push(landLoc.add(new Vector2(-dx,-dy)));
        }

    landLocs.push(landLoc);

    return landLocs;
}


export class Land extends Entity{

    private actors = new Set<Actor>();
    private bricks = new IndexedStore<Brick,typeof BuildBrickOffsetHash>(BuildBrickOffsetHash);

    constructor(private landLoc:Vector2,private initLandData:LandData){
        super();

        this.setLandData(initLandData);
    }
    setLandData(landData : LandData){
        
        for(const brick of landData.bricks){
            const brickLoc = new Vector2(brick.offX,brick.offY);
            const hash = BuildBrickOffsetHash(brickLoc);
            if(this.bricks.has(hash)){
                this.bricks.remove(this.bricks.get(hash)!)
            }else{
                this.bricks.add(new Brick(brickLoc,brick.type));
            }
        }
    }
    /**
     * LandData是可序列化的Land对象
     * 描述一个Land所有需要持久化、网络传输的属性
     */
    getLandData(){
        const landData : LandData = {
            bricks:[]
        };
        for(const brick of this.bricks.getAll()){
            const offLoc = brick.getOffsetLoc();;
            const brickData : BrickData = {
                offX:offLoc.x,
                offY:offLoc.y,
                type:brick.getType()
            }
            
            landData.bricks.push(brickData);
        }

        return landData;
    }
    getLandLoc(){
        return this.landLoc;
    }
    addBrick(brick : Brick){
        this.bricks.add(brick);
    }
    removeBrick(brick : Brick){
        this.bricks.remove(brick);
    }
    getBrick(hash : string){
        return this.bricks.get(hash);
    }

    addActor(actor: Actor){
        this.actors.add(actor)
    }
    hasActor(actor : Actor){
        return this.actors.has(actor);
    }
    removeActor(actor: Actor){
        this.actors.delete(actor);
    }
    getAllActors(){
        return Array.from(this.actors.values());
    }
    async doTick(tick: number) {
        
    }
}