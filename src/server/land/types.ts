export enum BrickType{
    /**
     * 岩石
     */
    ROCK = "rock",

    /**
     * 草地
     */
    GRASS = "grass",

}
export interface BrickData{
    offX : number;
    offY : number;
    
    type : BrickType;
}

export enum LandEvent{
    LandLoaded = "LandLoaded",
    LandUnloaded = "LandUnloaded"
}

export interface LandData {
    bricks : BrickData[]
}
