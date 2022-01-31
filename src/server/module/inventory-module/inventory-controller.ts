import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { InventoryManager } from './inventory-manager';
import { PlayerManager } from '../player-module/player-manager';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import * as ClientEvents from '../../../client/event';

import * as ExternalEvents from '../../event';

@injectable()
export class InventoryController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(InventoryManager) private inventoryManager: InventoryManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('inventoryManager', 'UpdateContainerEvent')
	private emitToPlayer(ev: any) {
		return this.playerManager.getEntityById(ev.playerId).connId;
	}

	@HandleRemoteEvent(ClientEvents.SetShortcutIndexEvent)
	private handleSetShortcutIndex(connId: string, event: ClientEvents.SetShortcutIndexEvent) {
		this.inventoryManager.setShortcutIndex(event.containerId, event.indexAt);
	}

	@HandleRemoteEvent(ClientEvents.ContainerMoveBlockEvent)
	private handleContainerMoveBlock(connId: string, event: ClientEvents.ContainerMoveBlockEvent) {
		this.inventoryManager.moveContainerBlock(event.sourceContainerId, event.sourceIndex, event.targetContainerId, event.targetIndex);
	}
}
