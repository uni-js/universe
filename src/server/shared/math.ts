import RandomBytes from "randombytes";

export class Vector2{
    constructor(
        public x:number,
        public y:number
    ){

    }

    divFloor(ratio:number){
        return new Vector2(Math.floor(this.x / ratio),Math.floor(this.y / ratio));
    }
    mul(ratio:number){
        return new Vector2(this.x * ratio,this.y * ratio);
    }
    equals(vec:Vector2){
        return this.x == vec.x && this.y == vec.y;
    }
    clone(){
        return new Vector2(this.x,this.y);
    }
    add(delta:Vector2){
        return new Vector2(this.x + delta.x,this.y+delta.y);
    }
    sub(delta:Vector2){
        return new Vector2(this.x - delta.x,this.y-delta.y);
    }
    distanceTo(vec:Vector2){
        return vec.sub(this).getSqrt();
    }
    getSqrt(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    static getVectorDelta(v1:Vector2,v2:Vector2) : Vector2{
        return new Vector2(v2.x-v1.x,v2.y-v1.y);
    }

}

export function GetUniqueId(){
    return RandomBytes(8).toString("hex");
}

export function Divide2DVector(vec:Vector2,xwidth:number,ywidth:number){
    const x = Math.floor(vec.x / xwidth);
    const y = Math.floor(vec.y / ywidth);

    return new Vector2(x,y);
}