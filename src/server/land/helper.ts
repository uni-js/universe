import { Vector2 } from "../shared/math";
import { LAND_WIDTH } from "./const";

export function LocToLandLoc(loc:Vector2){
    const landLoc = loc.divFloor(LAND_WIDTH);
    return landLoc;
}
export function LandLocToLoc(landLoc:Vector2){
    const loc = landLoc.mul(LAND_WIDTH);
    return loc;
}
