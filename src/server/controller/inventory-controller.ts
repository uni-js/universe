import { EventBus, EventBusSymbol } from '../../event/bus-server';
import { Controller } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { GameEvent } from '../event';
import { ContainerUpdateData } from '../inventory';
import { Container } from '../entity/inventory';
import { Player } from '../entity/player';
import { UpdateContainer } from '../../event/server-side';
import * as ClientEvents from '../../client/event/external';

@injectable()
export class InventoryController implements Controller {
	constructor(@inject(EventBusSymbol) private eventBus: EventBus, @inject(InventoryManager) private inventoryManager: InventoryManager) {
		this.inventoryManager.on(GameEvent.UpdateInventoryEvent, this.onUpdateInventoryEvent);

		this.eventBus.on(ClientEvents.SetShortcutIndexEvent.name, this.handleSetShortcutIndex);
	}
	private handleSetShortcutIndex = (connId: string, event: ClientEvents.SetShortcutIndexEvent) => {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	};

	private onUpdateInventoryEvent = (updateData: ContainerUpdateData, container: Container, isFullUpdate: boolean, player: Player) => {
		const event = new UpdateContainer(container.$loki, container.containerType, updateData, isFullUpdate);
		this.eventBus.emitTo([player.connId], event);
	};

	doTick(tick: number) {}
}
