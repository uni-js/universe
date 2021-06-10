import { BrickType } from "../../server/entity/brick/types";
import { Vector2 } from "../../server/shared/math";
import { StaticObject } from "../layer/game-object";
import { TextureManager } from "../texture";
import * as PIXI from "pixi.js";
import { LAND_WIDTH } from "../../server/land/const";

export class BrickObject extends StaticObject{
    private highlightObject : PIXI.Sprite;

    constructor(
        
        private brickType : BrickType,
        objectId : string,
        textureManager : TextureManager,
        loc:Vector2,
        private landLoc:Vector2,
        private offLoc:Vector2
    ){
        super(textureManager,objectId,new Vector2(1,1),loc,landLoc.mul(LAND_WIDTH).add(offLoc));
        
        this.highlightObject = PIXI.Sprite.from(this.textureManager.getOne(`system.brick_highlight`)!);
        this.highlightObject.width = 1;
        this.highlightObject.height = 1;    
        this.highlightObject.visible = false;
        
        this.addChild(this.highlightObject)
        
        this.loadTexture();
    }
    setHighLight(bool : boolean){
        this.highlightObject.visible = bool;

    }
    getHighLight(){
        return this.highlightObject.visible;
    }
    getOffsetLoc(){
        return this.offLoc;
    }
    getLandLoc(){
        return this.landLoc;
    }
    getType(){
        return this.brickType;
    }
    private loadTexture(){
        const texture = this.textureManager.getOne(`brick.${this.brickType}.normal`);
        if(!texture)
            throw new Error(`${this.brickType} 的材质未找到`);

        this.sprite.texture = texture;
    }
}