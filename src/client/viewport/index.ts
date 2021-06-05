import * as PIXI from "pixi.js";

export class Viewport extends PIXI.Container{
    constructor(private worldWidth:number,private worldHeight:number){
        super();
    }
    moveCenter(x:number,y:number){
        this.position.set((this.worldWidth/2) - x,(this.worldHeight/2) - y);
    }
}