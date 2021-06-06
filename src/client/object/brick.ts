import { BrickType } from "../../server/entity/brick/types";
import { Vector2 } from "../../server/shared/math";
import { StaticObject } from "../layer/game-object";
import { TextureManager } from "../texture";

export class Brick extends StaticObject{
    constructor(
        
        private brickType : BrickType,
        objectId : string,
        textureManager : TextureManager,
        loc:Vector2
    ){
        super(textureManager,objectId,new Vector2(1,1),loc);
        
        this.zIndex = 0;

        this.loadTexture();
    }

    private loadTexture(){
        const texture = this.textureManager.getOne(`brick.${this.brickType}.normal`);
        if(!texture)
            throw new Error(`${this.brickType} 的材质未找到`);

        this.texture = texture;
    }
}