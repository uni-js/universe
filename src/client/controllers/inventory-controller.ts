import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { ShortcutManager, BackpackManager } from '../managers/inventory-manager';
import { ClientSideController } from '@uni.js/client';

import * as ServerEvents from '../../server/event';

import * as ExternalEvents from '../event';
import { EmitLocalEvent, HandleRemoteEvent } from '@uni.js/event';
import { ContainerType } from '../../server/types/container';

@injectable()
export class InvetoryController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,
		@inject(BackpackManager) private backpackManager: BackpackManager,
	) {
		super(eventBus);
	}

	@EmitLocalEvent('shortcutManager', 'SetShortcutIndexEvent')
	@EmitLocalEvent('backpackManager', 'ContainerMoveBlockEvent')
	private emitLocalEvent() {}

	@HandleRemoteEvent(ServerEvents.UpdateContainerEvent)
	private handleUpdateContainer(event: ServerEvents.UpdateContainerEvent) {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		} else if (event.containerType == ContainerType.BACKPACK_CONTAINER) {
			this.backpackManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		}
	}
}
