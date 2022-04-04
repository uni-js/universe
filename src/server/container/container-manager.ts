import type { Container } from "./container"
import type { Server } from "../server"
import { IEventBus } from "@uni.js/server";
import { MoveItemEvent } from "../event/client";

export class ContainerManager {
    private containers = new Map<number, Container>();
    private eventBus: IEventBus;
    constructor(private server: Server) {
        this.eventBus = this.server.getEventBus();
        this.eventBus.on(MoveItemEvent, this.onMoveItemEvent.bind(this))
    }

    private onMoveItemEvent(event: MoveItemEvent) {
        const from = this.containers.get(event.fromCont);
        const to = this.containers.get(event.toCont);
        if (!from || !to) {
            return;
        }

        from.moveTo(event.fromIndex, to, event.toIndex);
    }

    add(container: Container) {
        this.containers.set(container.getId(), container);
    }

    get(id: number) {
        return this.containers.get(id);
    }
}