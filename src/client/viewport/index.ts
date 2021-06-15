import * as PIXI from "pixi.js";

interface Point{
    x:number;
    y:number;
}

export interface IViewport{
    moveCenter(x:number,y:number) : void;
    getWorldPointAt(screenPoint : Point):Point;
    getWorldWidth():number;
    getWorldHeight():number;
}

export class Viewport extends PIXI.Container implements IViewport{
    constructor(
        private screenWidth: number,
        private screenHeight:number,
        private worldWidth:number,
        private worldHeight:number
    ){
        super();
    }
    moveCenter(x:number,y:number){
        this.position.set((this.worldWidth/2) - x,(this.worldHeight/2) - y);
    }
    getWorldPointAt(screenPoint : Point) : Point{
        const ratioW = this.worldWidth / this.screenWidth;
        const ratioH = this.worldHeight / this.screenHeight;

        const screenX = screenPoint.x;
        const screenY = screenPoint.y;

        return {x:screenX * ratioW - this.position.x, y:screenY * ratioH - this.position.y};
    }
    getWorldWidth(){
        return this.worldWidth;
    }
    getWorldHeight(){
        return this.worldHeight;
    }
}