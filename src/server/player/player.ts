import { Actor, AttachPos } from "../actor/actor";
import { Vector2 } from "../utils/vector2";
import { Backpack } from "../container/backpack";
import { Shortcut } from "../container/shortcut";
import { Item } from "../item/item";
import { RemoveLandEvent } from "../event/server";
import { ActorType } from "../actor/actor-type";
import { Land, posToLandPos } from "../land/land";
import type { Server } from "../server";
import { Input } from "@uni.js/prediction";

const PLAYER_CANSEE_LAND_RADIUS = 2;

export class Player extends Actor{
    private connId: string;
    private backpack: Backpack;
    private shortcut: Shortcut;
    private watchLands = new Set<Land>();

    constructor(pos: Vector2, connId: string, server: Server) {
        super(pos, server);
        this.connId = connId;

        this.backpack = new Backpack(this, server);
        this.shortcut = new Shortcut(this, server);

        this.watchLandsAllCansee();
    }

    getAttachPos(): AttachPos {
        return [
            [-0.4, -0.5],
            [0.4, -0.5],
            [0, -0.5],
            [0, -0.4]
        ]
    }

    getSize(): Vector2 {
        return new Vector2(1, 1.5);
    }

    isPlayer(): boolean {
        return true;
    }

    canSeeLand(landPos: Vector2): boolean {
        const radius = PLAYER_CANSEE_LAND_RADIUS;
        const myLandPos = this.getLandPos();
        const dis = landPos.sub(myLandPos, true);
        return dis.x <= radius && dis.y <= radius;
    }

    getCanSeeLandsPos(): Vector2[] {
        const rad = PLAYER_CANSEE_LAND_RADIUS;
        const myLandPos = this.getLandPos();
        const landPoses: Vector2[] = [];
        for (let x=myLandPos.x - rad; x<= myLandPos.x + rad; x++)
            for (let y=myLandPos.y - rad; y<= myLandPos.y + rad; y++)
            {
                landPoses.push(new Vector2(x, y));
            }

        return landPoses
    }

    getType(): number {
        return ActorType.PLAYER;
    }

    processInput(input: Input) {
        this.lastInputSeqId = input.seqId;
        this.moveToPosition(this.getPos().add(new Vector2(input.moveX, input.moveY)));
    }

    emitEvent(event: any) {
        this.manager.emitEvent(this, event);
    }

    moveToPosition(pos: Vector2): void {
        super.moveToPosition(pos);
        const nowLandPos = this.getLandPos();
        const toLandPos = posToLandPos(pos);
        const isCrossing = !nowLandPos.equal(toLandPos)
        if (isCrossing) {
            this.watchLandsAllCansee();
            this.unwatchUnvisibleLands();
        }
    }

    unwatchUnvisibleLands() {
        for(const watchLand of this.watchLands) {
            if(!this.canSeeLand(watchLand.getLandPos())) {
                this.unwatchLand(watchLand)
            }
        }
    }

    watchLandsAllCansee() {
        const landPosArray = this.getCanSeeLandsPos();
        for(const landPos of landPosArray) {
            const land = this.world.loadLand(landPos);
            this.watchLand(land);
        }
    }

    watchLand(land: Land) {
        if(this.watchLands.has(land)) {
            return;
        }

        this.watchLands.add(land);
        for(const actor of land.getActors()) {
            actor.showTo(this);
        }
    }

    unwatchLand(land: Land) {
        if(!this.watchLands.has(land)) {
            return;
        }

        if(land.isLoaded()) {
            const landPos = land.getLandPos();

            const event = new RemoveLandEvent();
            event.landX = landPos.x;
            event.landY = landPos.y;
    
            this.emitEvent(event);    
        }

        this.watchLands.delete(land);
        for(const actor of land.getActors()) {
            actor.unshowTo(this);
        }
    }

    addItem(item: Item, count: number) {
        if(this.backpack.isFull()) {
            console.error(`player connId=${this.connId} backpack is full`)
            return;
        }

        for(let i=0;i<this.backpack.getSize();i++) {
            const block = this.backpack.getBlock(i);
            if(block.getSpareSize() > count) {                    
                this.backpack.setItem(i, item, block.getCount() + count)
            }
        }
    }

    getConnId() {
        return this.connId;
    }
    
}