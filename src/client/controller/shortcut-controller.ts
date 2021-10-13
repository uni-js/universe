import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { ContainerType } from '../../server/inventory';
import { ShortcutManager } from '../manager/shortcut-manager';
import { GameController } from '../system/controller';

import * as ServerEvents from '../../server/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';

@injectable()
export class ShortcutController extends GameController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(ShortcutManager) private shortcutManager: ShortcutManager) {
		super(eventBus);

		this.eventBus.on(ServerEvents.UpdateContainer.name, this.handleUpdateContainer);

		this.redirectToRemoteEvent(this.shortcutManager, Events.SetShortcutIndexEvent, ExternalEvents.SetShortcutIndexEvent);
	}

	private handleUpdateContainer = (event: ServerEvents.UpdateContainer) => {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		}
	};
}
