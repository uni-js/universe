import { EventBus } from '../../event/bus-server';
import { Controller } from '../shared/controller';
import { inject, injectable } from 'inversify';
import { InventoryManager } from '../manager/inventory-manager';
import { GameEvent } from '../event';
import { ContainerUpdateData } from '../inventory';
import { Container } from '../entity/inventory';
import { Player } from '../entity/player';
import { UpdateContainer } from '../../event/server-side';
import { SetShortcutIndexEvent } from '../../event/client-side';

@injectable()
export class InventoryController implements Controller {
	constructor(@inject(EventBus) private eventBus: EventBus, @inject(InventoryManager) private inventoryManager: InventoryManager) {
		this.inventoryManager.on(GameEvent.UpdateInventoryEvent, this.onUpdateInventoryEvent);

		this.eventBus.on(SetShortcutIndexEvent.name, this.handleSetShortcutIndex);
	}
	private handleSetShortcutIndex = (connId: string, event: SetShortcutIndexEvent) => {
		this.inventoryManager.setShortcutIndex(event.containerId, event.index);
	};

	private onUpdateInventoryEvent = (updateData: ContainerUpdateData, container: Container, isFullUpdate: boolean, player: Player) => {
		const event = new UpdateContainer(container.$loki, container.containerType, updateData, isFullUpdate);
		this.eventBus.emitTo([player.connId], event);
	};

	doTick(tick: number) {}
}
