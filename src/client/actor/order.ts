import { DisplayObject } from "pixi.js";

const BILLION_VALUE = 10000000;

export function orderObject(object: DisplayObject) {
    object.zIndex = 2 + object.y / BILLION_VALUE;
}