import { LAND_WIDTH } from "../../server/land/const";
import { BrickType } from "../../server/land/types";
import { Vector2 } from "../../server/shared/math";
import { SpriteGameObject } from "../layer/game-object";
import { TextureManager } from "../texture";

export class Brick extends SpriteGameObject{
    constructor(
        private brickType : BrickType,
        textureManager : TextureManager,
        loc:Vector2
    ){
        super(textureManager,"",new Vector2(1,1),loc);

        this.zIndex = 0;

        this.loadTexture();
    }
    private loadTexture(){
        const texture = this.textureManager.get(`brick.${this.brickType}.normal`);
        if(!texture)
            throw new Error(`${this.brickType} 的材质未找到`);

        this.texture = texture;
    }
}