import { Vector2 } from "../utils/vector2";
import { Land } from "./land";
import type { Server } from "../server";
import type { Actor } from "../actor/actor";
import { QueuedWorker } from "../utils/queued-worker";
import { spawn, Worker } from "threads"
import { IPersistDatabase } from "../database/database";

export class World {
    private lands = new Map<string, Land>();
    private actors = new Map<number, Actor>();
    private database: IPersistDatabase;
    private queuedLandLoader : QueuedWorker;
	private generatorWorker = spawn(new Worker('./generator'));

    constructor(private server: Server) {
        this.database = this.server.getDatabase();
        this.queuedLandLoader = new QueuedWorker(this.onLoadLand.bind(this));
    }

    private async onLoadLand(landPos: Vector2) {
        let landData = this.database.get(landPos.toHash('land'));
        if (!landData) {
            landData = await this.generateLand(landPos);
        }

        const land = this.getLand(landPos);
        land.setLoaded();
    }

    getActor(actorId: number) {
        return this.actors.get(actorId);
    }

    addActor(actor: Actor) {
        if(this.actors.has(actor.getId())) {
            return;
        }

        const landPos = actor.getLandPos();
        const land = this.loadLand(landPos);

        land.addActor(actor);

        this.actors.set(actor.getId(), actor);
        actor.showToAllCansee();
    }

    removeActor(actor: Actor) {
        if(!this.actors.has(actor.getId())) {
            return;
        }
        const landPos = actor.getLandPos();
        const land = this.getLand(landPos);
        if (land) {
            land.removeActor(actor);
        } else {
            console.error(`no actor when remove: ${actor.getId()} at: land=${landPos.x}:${landPos.y}`)
        }

        this.actors.delete(actor.getId());
        actor.unshowToAll()
    }

    getLand(pos: Vector2) {
        return this.lands.get(pos.toHash());
    }

    loadLand(landPos: Vector2) : Land {
        let land = this.getLand(landPos);
        if (land) {
            return land;
        }
        
        land = new Land(landPos, this.server);
        this.lands.set(landPos.toHash(),land);
        this.queuedLandLoader.addTask(landPos);
        return land;
    }

    private async generateLand(landPos: Vector2) {
        const worker = await this.generatorWorker;
		const landData = await worker.GenerateLandData(landPos.x, landPos.y, 'LAND_SEED');
        this.server.getDatabase().set(landPos.toHash("land"), landData);
        return landData;
    }

    doTick() {
        for(const actor of this.actors.values()) {
            actor.doTick();
        }

    }
}