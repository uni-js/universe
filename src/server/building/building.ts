import { Land, posToLandPos } from "../land/land";
import { Square2, Vector2 } from "../utils/vector2";
import type { Player } from "../player/player";
import { AttributeMap } from "../actor/attribute";
import { AddBuildingEvent, BuildingUpdateAttrsEvent, RemoveBuildingEvent } from "../event/server";
import type { World } from "../land/world";
import { BuildingType } from "./building-type";
import { Viewable } from "../actor/viewable";
import type { Server } from "../server";

export interface BuildingData {
    x: number;
    y: number;
    attrs: any;
}

export abstract class Building extends Viewable {
    protected meta: number = 0;

    private pos: Vector2;
    private attrs = new AttributeMap();
    private defaultAnchor = new Vector2(0.5, 1);
    private defaultSize = new Vector2(1, 1);
    private world: World;

    constructor(private server: Server, pos: Vector2) {
        super(server)

        this.pos = pos.floorMid();
        this.world = this.server.getWorld();
    }

    getAnchor() {
        return this.defaultAnchor;
    }

    getSize() {
        return this.defaultSize;
    }

    getBoundings() {
        return new Square2(this.pos, this.pos.add(this.defaultSize))
    }

    getPos() {
        return this.pos;
    }

    getHash() {
        return this.pos.toHash(`building`);
    }

    getLandPos() {
        return posToLandPos(this.pos);
    }

    canCheckBeOverlap() {
        return true;
    }

    onBeshownToPlayer(player: Player): void {
        this.updateAttrs();

        const event = new AddBuildingEvent();
        event.x = this.pos.x;
        event.y = this.pos.y;
        event.bType = this.getType();
        event.attrs = this.attrs.getAll();

        player.emitEvent(event);
    }

    onBeunshownToPlayer(player: Player): void {
        const event = new RemoveBuildingEvent();
        event.x = this.pos.x;
        event.y = this.pos.y;

        player.emitEvent(event);
    }

    interact(player: Player) {
        
    }

    touch(player: Player) {
        
    }

    updateAttrs() {
        this.attrs.set('meta', this.meta);

        const {x: sizeX, y: sizeY} = this.getSize();
        this.attrs.set('sizeX', sizeX);
        this.attrs.set('sizeY', sizeY);

        const {x: anchorX, y: anchorY} = this.getAnchor();
        this.attrs.set('anchorX', anchorX);
        this.attrs.set('anchorY', anchorY);
    }

	private doUpdateAttrsTick() {
		this.updateAttrs();
		if (this.attrs.hasDirty()) {
			const event = new BuildingUpdateAttrsEvent();
			event.x = this.pos.x;
            event.y = this.pos.y;
			event.updated = this.attrs.getDirtyAll();
			this.attrs.cleanAllDirty();

			this.world.emitToViewers(this, event);
		}
	}

    getBuildingData(): BuildingData {
        return {
            x: this.pos.x,
            y: this.pos.y,
            attrs: this.attrs.getAll(),
        }
    }

    doTick() {
        this.doUpdateAttrsTick();

    }

    abstract getType(): BuildingType;
}