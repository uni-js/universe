import { BusEvent, EventBusServer, IEventBus } from "@uni.js/server";
import { IPersistDatabase } from "../database/database";
import { Player } from "./player";
import { Vector2 } from "../utils/vector2";
import type { Actor } from "../actor/actor";
import type { Server } from "../server"
import { ControlMoveEvent, ControlWalkEvent, LoginEvent } from "../event/client";
import { LoginedEvent } from "../event/server";
import type { World } from "../land/world";

export class PlayerManager{
    private playerList = new Map<string, Player>();
    private eventBus: IEventBus;
    private database: IPersistDatabase;
    private world: World;
    
    constructor(private server: Server) {
        this.eventBus = this.server.getEventBus();
        this.database = this.server.getDatabase();
        this.world = this.server.getWorld();

        this.eventBus.on(LoginEvent, this.onPlayerLogined.bind(this));
        this.eventBus.on(ControlMoveEvent, this.onControlMoveEvent.bind(this));
        this.eventBus.on(ControlWalkEvent, this.onControlWalkEvent.bind(this));
        this.eventBus.on(BusEvent.ClientDisconnectEvent, this.onPlayerLogout.bind(this));
    }

    private onControlWalkEvent(event: ControlWalkEvent) {
        const player = this.getPlayerByActorId(event.actorId);
        player.setDirection(event.direction);
        player.setRunning(event.running);
    }

    private onControlMoveEvent(event: ControlMoveEvent) {
        const player = this.getPlayerByActorId(event.actorId);
        player.processInput(event.input);
    }

    private async onPlayerLogined(event: LoginEvent, connId: string) {
        let pos = new Vector2(0,0);
        const storedPos = await this.database.get(`player.${event.username}.pos`);
        if(storedPos) {
            const {x, y} = storedPos;
            pos = new Vector2(x, y);
        }
        const player = new Player(pos, connId, this.server);
        this.playerList.set(connId, player);

        this.world.addActor(player);

        const loginedEvent = new LoginedEvent();
        loginedEvent.playerActorId = player.getId();
        this.eventBus.emitTo(connId, loginedEvent);

        console.log(`player: ${event.username} is logined with connId=${connId}`)
    }

    private onPlayerLogout(connId: string) {
        const player = this.playerList.get(connId);
        if (!player) {
            return;
        }
        this.playerList.delete(connId);

        this.world.removeActor(player);
    }

    emitToViewers(actor: Actor, event: any) {
        actor.getViewers().forEach((viewer) => {
            this.eventBus.emitTo(viewer.getConnId(), event);
        })
    }

    emitEvent(player: Player, event: any) {
        this.eventBus.emitTo(player.getConnId(), event);
    }

    isLogined(player: Player) {
        return this.playerList.has(player.getConnId());
    }

    getPlayerByActorId(actorId: number): Player {
        const actor = this.world.getActor(actorId);
        if (!actor.isPlayer()) {
            return;
        }
        return actor as Player;
    }

    getPlayerList() {
        return this.playerList;
    }
}