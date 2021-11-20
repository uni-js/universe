import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../../framework/client-side/bus-client';
import { ContainerType } from '../../../server/module/inventory-module/spec';
import { ShortcutManager, BackpackManager } from './inventory-manager';
import { ClientSideController } from '../../../framework/client-side/client-controller';

import * as ServerEvents from '../../../server/event/external';

import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { HandleExternalEvent } from '../../../framework/event';

@injectable()
export class InvetoryController extends ClientSideController {
	constructor(
		@inject(EventBusClient) eventBus: EventBusClient,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,
		@inject(BackpackManager) private backpackManager: BackpackManager,
	) {
		super(eventBus);

		this.redirectToBusEvent(this.shortcutManager, Events.SetShortcutIndexEvent, ExternalEvents.SetShortcutIndexEvent);
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
