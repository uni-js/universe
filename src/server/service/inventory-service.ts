import { EventBus } from '../../event/bus-server';
import { Service } from '../shared/service';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { GameEvent } from '../event';
import { ContainerUpdateData } from '../../shared/inventory';
import { Container } from '../entity/inventory';
import { Player } from '../entity/player';
import { UpdateContainer } from '../../event/server-side';

@injectable()
export class InventoryService implements Service {
	constructor(@inject(EventBus) private eventBus: EventBus, @inject(InventoryManager) private inventoryManager: InventoryManager) {
		this.inventoryManager.on(GameEvent.UpdateInventoryEvent, this.onUpdateInventoryEvent);
	}

	private onUpdateInventoryEvent = (updateData: ContainerUpdateData, container: Container, isFullUpdate: boolean, player: Player) => {
		const event = new UpdateContainer(container.$loki, container.containerType, updateData, isFullUpdate);
		this.eventBus.emitTo([player.connId], event);
	};

	doTick(tick: number) {}
}
