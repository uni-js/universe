import { EventBusServer, EventBusServerSymbol } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';
import { inject, injectable } from 'inversify';
import { InventoryMgr } from '../managers/inventory-mgr';
import { PlayerMgr } from '../managers/player-mgr';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import * as ClientEvents from '../../client/event';

import * as ExternalEvents from '../event';

@injectable()
export class InventoryController extends ServerSideController {
	constructor(
		@inject(EventBusServerSymbol) eventBus: EventBusServer,
		@inject(InventoryMgr) private inventoryMgr: InventoryMgr,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('inventoryMgr', 'UpdateContainerEvent')
	private emitToPlayer(ev: any) {
		return this.playerMgr.getEntityById(ev.playerId).connId;
	}

	@HandleRemoteEvent(ClientEvents.SetShortcutIndexEvent)
	private handleSetShortcutIndex(connId: string, event: ClientEvents.SetShortcutIndexEvent) {
		this.inventoryMgr.setShortcutIndex(event.containerId, event.indexAt);
	}

	@HandleRemoteEvent(ClientEvents.ContainerMoveBlockEvent)
	private handleContainerMoveBlock(connId: string, event: ClientEvents.ContainerMoveBlockEvent) {
		this.inventoryMgr.moveContainerBlock(event.sourceContainerId, event.sourceIndex, event.targetContainerId, event.targetIndex);
	}
}
