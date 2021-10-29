import { EventBus, EventBusSymbol } from '../../framework/bus-server';
import { ServerController } from '../../framework/server-controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { HandleExternalEvent } from '../../framework/event';
import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class InventoryController extends ServerController {
	constructor(
		@inject(EventBusSymbol) eventBus: EventBus,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(
			this.inventoryManager,
			Events.UpdateContainer,
			ExternalEvents.UpdateContainer,
			(ev) => this.playerManager.getEntityById(ev.playerId).connId,
		);
	}

	@HandleExternalEvent(ClientEvents.SetShortcutIndexEvent)
	private handleSetShortcutIndex(connId: string, event: ClientEvents.SetShortcutIndexEvent) {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	}
}
