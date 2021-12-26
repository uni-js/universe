import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { ContainerType } from '../../../server/module/inventory-module/spec';
import { ShortcutManager, BackpackManager } from './inventory-manager';
import { ClientSideController } from '@uni.js/client';

import * as ServerEvents from '../../../server/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { HandleExternalEvent } from '@uni.js/event';

@injectable()
export class InvetoryController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,
		@inject(BackpackManager) private backpackManager: BackpackManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.shortcutManager, Events.SetShortcutIndexEvent, ExternalEvents.SetShortcutIndexEvent);
		this.redirectToBusEvent(this.backpackManager, Events.ContainerMoveBlockEvent, ExternalEvents.ContainerMoveBlockEvent);
	}

	@HandleExternalEvent(ServerEvents.UpdateContainerEvent)
	private handleUpdateContainer(event: ServerEvents.UpdateContainerEvent) {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		} else if (event.containerType == ContainerType.BACKPACK_CONTAINER) {
			this.backpackManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		}
	}
}
