import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { ServerController } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { ConvertInternalToExternalEvent, HandleExternalEvent, HandleInternalEvent } from '../../event/spec';
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
	}

	@HandleInternalEvent('inventoryManager', Events.UpdateContainer)
	private onUpdateInventoryEvent(event: Events.UpdateContainer) {
		const player = this.playerManager.getEntityById(event.playerId);
		const exEvent = ConvertInternalToExternalEvent(event, Events.UpdateContainer, ExternalEvents.UpdateContainer);

		this.eventBus.emitTo([player.connId], exEvent);
	}

	@HandleExternalEvent(ClientEvents.SetShortcutIndexEvent)
	private handleSetShortcutIndex(connId: string, event: ClientEvents.SetShortcutIndexEvent) {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	}
}
