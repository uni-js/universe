import { LAND_WIDTH } from "../../server/land/const";
import { LandData } from "../../server/land/types";
import { Vector2 } from "../../server/shared/math";
import { StaticObject } from "../layer/game-object";
import { TextureManager } from "../texture";
import { Brick } from "./brick";

export class Land extends StaticObject{
    constructor(
        initLandData:LandData,
        textureManager : TextureManager,
        objectId:string,
        landLoc:Vector2){
        
        super(textureManager,objectId,new Vector2(1,1),landLoc.mul(LAND_WIDTH));
        this.zIndex = 0;
        
        this.setLandData(initLandData)
    }
    setLandData(landData : LandData){
        for(const [index,brick] of landData.bricks.entries()){
            const landLocAt = this.getLocation();
            const brickLoc = new Vector2(brick.offX,brick.offY);
            this.addChild(new Brick(brick.type,"",this.textureManager,brickLoc))
        }
    }

}
