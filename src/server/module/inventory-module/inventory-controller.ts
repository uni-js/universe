import { EventBusServer, EventBusServerSymbol } from '../../../framework/server-side/bus-server';
import { ServerSideController } from '../../../framework/server-side/server-controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from './inventory-manager';
import { PlayerManager } from '../player-module/player-manager';
import { HandleExternalEvent } from '../../../framework/event';
import * as ClientEvents from '../../../client/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

@injectable()
export class InventoryController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.inventoryManager,
			Events.UpdateContainerEvent,
			ExternalEvents.UpdateContainerEvent,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
	}

	@HandleExternalEvent(ClientEvents.SetShortcutIndexEvent)
	private handleSetShortcutIndex(connId: string, event: ClientEvents.SetShortcutIndexEvent) {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	}

	@HandleExternalEvent(ClientEvents.ContainerMoveBlockEvent)
	private handleContainerMoveBlock(connId: string, event: ClientEvents.ContainerMoveBlockEvent) {
		this.inventoryManager.moveContainerBlock(event.sourceContainerId, event.sourceIndex, event.targetContainerId, event.targetIndex);
	}
}
