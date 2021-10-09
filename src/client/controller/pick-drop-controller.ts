import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { DropItemEvent } from '../../event/client-side';
import { GameEvent } from '../event';
import { PickDropManager } from '../manager/pick-drop-manager';

@injectable()
export class PickDropController {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(PickDropManager) private pickDropManager: PickDropManager,
	) {
		this.pickDropManager.on(GameEvent.DropItemEvent, this.onDroppedItem);
		this.pickDropManager.on(GameEvent.PickItemEvent, this.onPickingItem);
	}
	private onPickingItem = () => {};
	private onDroppedItem = () => {
		this.eventBus.emitEvent(new DropItemEvent());
	};
}
