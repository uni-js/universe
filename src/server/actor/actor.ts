import { ActorAttachEvent, AddActorEvent, MoveActorEvent, RemoveActorEvent, UpdateAttrsEvent } from "../event/server";
import { Vector2 } from "../utils/vector2";
import type { PlayerManager } from "../player/player-manager"
import type { Server } from "../server";
import type { World } from "../land/world";
import { Player } from "../player/player";
import { posToLandPos } from "../land/land";
import { IEventBus } from "@uni.js/server";
import { AttributeMap } from "./attribute";


export enum RunningType {
    SILENT,
    WALKING,
    RUNNING
}

export enum DirectionType{
    FORWARD,
    BACK,
    LEFT,
    RIGHT
}

export interface AttachPos {
	[DirectionType.BACK]: [number, number];
	[DirectionType.FORWARD]: [number, number];
	[DirectionType.LEFT]: [number, number];
	[DirectionType.RIGHT]: [number, number];
	[key: number]: [number, number];
}

export abstract class Actor {
    static actorIdSum = 0;
    private id: number;
    private pos: Vector2;
    private attaching: Actor | undefined;
    private attachment: Actor | undefined;
    protected attrs = new AttributeMap();
    protected manager: PlayerManager;
    protected useTicks: number = 0;
    protected world: World;
    protected eventBus: IEventBus;
    protected lastInputSeqId = 0;
    private direction = DirectionType.FORWARD;
    private running = RunningType.SILENT;
    private viewingPlayers = new Set<Player>();
    private isPosDirty = false;
    private isUsing: boolean = false;

    constructor(pos: Vector2, protected server: Server) {
        this.id = Actor.actorIdSum++;
        this.pos = pos;
        this.manager = this.server.getPlayerManager();
        this.world = this.server.getWorld();
        this.eventBus = this.server.getEventBus();
    }

    abstract getSize(): Vector2;
    abstract getType(): number;

    getAttachPos() : AttachPos {
        return [[0,0],[0,0],[0,0],[0,0]];
    }

    isPlayer() {
        return false;
    }

    getId() {
        return this.id;
    }

    getPos() {
        return this.pos;
    }

    getLandPos() {
        return posToLandPos(this.pos);
    }

    getX() {
        return this.pos.x;
    }

    getY() {
        return this.pos.y;
    }

    setDirection(direction: DirectionType) {
        this.direction = direction;
    }

    setRunning(running: RunningType) {
        this.running = running;
    }

    attach(actor: Actor) {
        if (actor.attachment) {
            console.error(`error when actor:${this.id} attach to actor:${actor.getId()}`);
            return;
        }

        this.attaching = actor;
        actor.attachment = this;

        const event = new ActorAttachEvent();
        event.actorId = this.id;
        event.attachTo = actor.getId();

        this.manager.emitToViewers(actor, event);
    }

    showTo(player: Player) {
        if(this.viewingPlayers.has(player)) {
            return;
        }
        this.viewingPlayers.add(player);
        
        this.updateAttrs();
        const event = new AddActorEvent();
        event.actorId = this.getId();
        event.actorType = this.getType();
        event.x = this.getX();
        event.y = this.getY();
        event.attrs = this.attrs.getAll();

        player.emitEvent(event);
    }

    unshowTo(player: Player) {
        if(!this.viewingPlayers.has(player)) {
            return;
        }
        this.viewingPlayers.delete(player);

        const event = new RemoveActorEvent();
        event.actorId = this.getId();

        player.emitEvent(event);
    }

    showToAllCansee() {
        for(const player of this.server.getPlayerList().values()) {
            if(player.canSeeLand(this.getLandPos())) {
                this.showTo(player);
            }
        }
    }

    unshowToAll() {
        for(const viewer of this.getViewers()){
            this.unshowTo(viewer);
        }
    }

    getViewers() {
        return Array.from(this.viewingPlayers.values());
    }

    getLand() {
        return this.server.getWorld().getLand(this.getLandPos());
    }

    kill() {
        this.getLand().removeActor(this);
    }

    startUsing() {
        this.isUsing = true;
    }

    endUsing() {
        this.isUsing = false;
    }

    update() {
        this.useTicks ++;
    }

    moveToPosition(pos: Vector2) {
        const nowLandPos = this.getLandPos();
        const toLandPos = posToLandPos(pos);
        const isCrossing = !nowLandPos.equal(toLandPos);

        if (isCrossing) {
            const land = this.world.loadLand(toLandPos);
            land.addActor(this);
            
            const prevLand = this.world.getLand(nowLandPos);
            prevLand.removeActor(this);
        }

        this.pos = pos.clone();
        this.isPosDirty = true;
    }

    protected updateAttrs() {
        this.attrs.set("direction", this.direction);
        this.attrs.set("running", this.running);
        this.attrs.set("attachment", this.attachment?.getId());

        const {x, y} = this.getSize();
        this.attrs.set("sizeX", x);
        this.attrs.set("sizeY", y);
        
    }

    private doPosDirtyTick() {
        if(this.isPosDirty) {
            const event = new MoveActorEvent();
            event.actorId = this.getId();
            event.x = this.pos.x;
            event.y = this.pos.y;
            event.inputSeq = this.lastInputSeqId;
    
            this.manager.emitToViewers(this, event);
            this.isPosDirty = false;
        }
    }

    private doUpdateAttrsTick() {
        this.updateAttrs();
        if(this.attrs.hasDirty()) {
            const event = new UpdateAttrsEvent();
            event.actorId = this.getId();
            event.updated = this.attrs.getDirtyAll();
            this.attrs.cleanAllDirty();

            this.manager.emitToViewers(this, event);
        }
    }

    doTick() {
        this.doUpdateAttrsTick();
        this.doPosDirtyTick()
    }
}