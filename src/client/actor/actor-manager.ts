import { EventBusClient, ObjectStore } from "@uni.js/client";
import { ActorType } from "../../server/actor/actor-type";
import { AddActorEvent, MoveActorEvent, RemoveActorEvent, UpdateAttrsEvent } from "../../server/event/server";
import { Vector2 } from "../../server/utils/vector2";
import { GameClientApp } from "../client-app"
import { Player } from "../player/player";
import { ActorObject } from "./actor";
import { Bow } from "./bow";

export class ActorManager{
    private actorStore : ObjectStore<ActorObject>;
    private eventBus: EventBusClient;
    constructor(private app: GameClientApp) {
        this.actorStore = new ObjectStore((actor: ActorObject) => [actor.getServerId()]);
        this.eventBus = this.app.eventBus;

        this.eventBus.on(AddActorEvent, this.onAddActorEvent.bind(this));
        this.eventBus.on(RemoveActorEvent, this.onRemoveActorEvent.bind(this));
        this.eventBus.on(MoveActorEvent, this.onMoveActorEvent.bind(this));
        this.eventBus.on(UpdateAttrsEvent, this.onUpdateAttrsEvent.bind(this));

        this.app.viewport.addChild(this.actorStore.container);
    }

    private onUpdateAttrsEvent(event: UpdateAttrsEvent) {
        const actor = this.actorStore.get(event.actorId);
        actor.updateAttrs(event.updated);        
    }

    private onMoveActorEvent(event: MoveActorEvent) {
        const actor = this.actorStore.get(event.actorId);
        if(actor.isPlayer()) {
            const player = <Player>actor;
            if(player.isMaster()) {
                player.ackInput({
                    x: event.x,
                    y: event.y,
                    motionX: 0,
                    motionY: 0,
                    lastProcessedInput: event.inputSeq
                })    
                return;
            }
        }
        actor.addMovePoint(new Vector2(event.x, event.y));
    }

    private onAddActorEvent(event: AddActorEvent) {
        let newActor;
        if (event.actorType === ActorType.PLAYER) {
            newActor = new Player(event.actorId, new Vector2(event.x, event.y), event.attrs, this.app);
        } else if (event.actorType === ActorType.BOW) {
            newActor = new Bow(event.actorId, new Vector2(event.x, event.y), event.attrs, this.app);
        }
        this.actorStore.add(newActor);
        console.log("a new actor has been added:", event);
    }

    private onRemoveActorEvent(event: RemoveActorEvent) {
        const actor = this.actorStore.get(event.actorId);
        this.actorStore.remove(actor);
    }

    getActor(...hashes: any[]) {
        return this.actorStore.get(...hashes);
    }

    doFixedUpdateTick(tick: number) {
        for(const actor of this.actorStore.getAll()) {
            actor.doFixedUpdateTick(tick);
        }
    }

    doUpdateTick(tick: number) {
        for(const actor of this.actorStore.getAll()) {
            actor.doUpdateTick(tick);
        }
    }
}