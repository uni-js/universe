import * as PIXI from "pixi.js";
import { TextureProvider } from "@uni.js/texture";
import { BrickType } from "../../server/bricks";
import type { World } from "../world/world";

export const BRICK_WIDTH = 32;

export abstract class Brick extends PIXI.Sprite{
    public type: BrickType;
    protected layer: number;
    protected textureProvider: TextureProvider
    constructor(x: number, y: number, layer: number, protected world: World) {
        super();
        this.x = x;
        this.y = y;
        this.layer = layer;
        this.type = this.getType();
        this.textureProvider = this.world.getApp().textureProvider;
    }
    
    abstract getType() : BrickType;
}

export abstract class LargeBrick extends Brick{
    constructor(x: number, y: number, layer: number, world: World) {
        super(x, y, layer, world);
        
        this.texture = this.textureProvider.get(`brick.${this.type}`);
    }

}