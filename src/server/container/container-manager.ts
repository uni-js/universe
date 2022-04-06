import type { Server } from '../server';
import { IEventBus } from '@uni.js/server';
import { MoveItemEvent } from '../event/client';
import type { ActiveContainer } from './active-container';

export class ContainerManager {
	private containers = new Map<number, ActiveContainer>();
	private eventBus: IEventBus;
	constructor(private server: Server) {
		this.eventBus = this.server.getEventBus();
		this.eventBus.on(MoveItemEvent, this.onMoveItemEvent.bind(this));
	}

	private onMoveItemEvent(event: MoveItemEvent) {
		const from = this.containers.get(event.fromCont);
		const to = this.containers.get(event.toCont);
		if (!from || !to) {
			return;
		}

		from.moveTo(event.fromIndex, to, event.toIndex);
	}

	add(container: ActiveContainer) {
		this.containers.set(container.getId(), container);
	}

	remove(container: ActiveContainer) {
		this.containers.delete(container.getId());
	}

	get(id: number) {
		return this.containers.get(id);
	}
}
