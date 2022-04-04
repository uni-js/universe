import type { Actor } from "../actor/actor";
import type { Vector2 } from "../utils/vector2";
import { Server } from "../server";
import type { Player } from "../player/player";

export interface BrickData {
    x: number;
    y: number;
    layers: number[];
}

export interface LandData{
    bricks: BrickData[];
}

export const BRICK_WIDTH = 32;

export function posToLandPos(pos: Vector2) {
    return pos.div(BRICK_WIDTH).floor();
}

export function landPosToPos(landPos: Vector2) {
    return landPos.mul(BRICK_WIDTH).floor();
}

export class Land{
    private loaded = false;
    private actors = new Set<Actor>();
    private pos: Vector2;

    constructor(pos: Vector2, private server: Server) {
        this.pos = pos;
    }

    isLoaded() {
        return this.loaded;
    }

    setLoaded() {
        this.loaded = true;
    }

    getLandPos() {
        return this.pos;
    }

    getLandPlayers() {
        return this.getActors().filter((item)=>(item.isPlayer()));
    }

    getActors() {
        return Array.from(this.actors.values());
    }

    addActor(actor: Actor) {
        this.actors.add(actor);
    }

    removeActor(actor: Actor) {
        this.actors.delete(actor);
    }
}