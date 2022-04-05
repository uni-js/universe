import { EventBusServer, BusEvent } from "@uni.js/server"
import { EventEmitter2 } from "eventemitter2";
import { ContainerManager } from "./container/container-manager";
import { createPersistDatabase, IPersistDatabase } from "./database/database";
import { World } from "./land/world";
import { PlayerManager } from "./player/player-manager";

function wait(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

export class Server extends EventEmitter2{
    private eventBusServer: EventBusServer;
    private playerManager: PlayerManager;
    private containerManager: ContainerManager;
    private database: IPersistDatabase;
    private world: World;

    constructor(dbPath: string) {
        super();
        this.database = createPersistDatabase(dbPath);
        this.eventBusServer = new EventBusServer(false);
        this.world = new World(this);
        this.containerManager = new ContainerManager(this);
        this.playerManager = new PlayerManager(this);
        this.startTickLoop();
    }

    private async startTickLoop() {
        while(true) {
            try{
                this.doTick()
            } catch (err) {
                console.error("error when ticking server", err);
            }
            await wait(50);
        }
    }

    private doTick() {
        this.world.doTick();
    }
    
    listen(port: number) {
        this.eventBusServer.listen(port);
    }

    getPlayerList() {
        return this.playerManager.getPlayerList();
    }

    getPlayers() {
        return this.playerManager.getPlayers();
    }

    getWorld() {
        return this.world;
    }

    getPlayerManager() {
        return this.playerManager;
    }

    getDatabase() {
        return this.database;
    }

    getEventBus() {
        return this.eventBusServer;
    }

    getContainerManager() {
        return this.containerManager;
    }

}