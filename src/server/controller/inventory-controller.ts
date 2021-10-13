import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { Controller } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { PlayerManager } from '../manager/player-manager';
import { ConvertInternalToExternalEvent } from '../../event/spec';
import * as ClientEvents from '../../client/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class InventoryController implements Controller {
	constructor(
		@inject(EventBusSymbol) private eventBus: EventBus,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		this.inventoryManager.onEvent(Events.UpdateContainer, this.onUpdateInventoryEvent);

		this.eventBus.on(ClientEvents.SetShortcutIndexEvent.name, this.handleSetShortcutIndex);
	}
	private handleSetShortcutIndex = (connId: string, event: ClientEvents.SetShortcutIndexEvent) => {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	};

	private onUpdateInventoryEvent = (event: Events.UpdateContainer) => {
		const player = this.playerManager.getEntityById(event.playerId);
		const exEvent = ConvertInternalToExternalEvent(event, Events.UpdateContainer, ExternalEvents.UpdateContainer);

		this.eventBus.emitTo([player.connId], exEvent);
	};

	doTick(tick: number) {}
}
