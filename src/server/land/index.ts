import Noise from "simplex-noise"
import { Vector2 } from "../shared/math";
import { LAND_WIDTH } from "./const";
import { BrickType, LandData } from "./types";

export function GenerateLandData(landLoc : Vector2) : LandData{
    const startAt = landLoc.mul(LAND_WIDTH);
    const seed = new Noise(process.env["LAND_SEED"] as string);
    const landData : LandData = {
        bricks:[]
    }
    for(let x=0;x<LAND_WIDTH;x++)
        for(let y=0;y<LAND_WIDTH;y++){
            const noise = seed.noise2D(startAt.x+x,startAt.y+y);
            const pick = noise > 0 ? BrickType.GRASS : BrickType.ROCK;

            landData.bricks.push({
                offX:x,
                offY:y,
                type:pick
            });

        }

    return landData;
}
