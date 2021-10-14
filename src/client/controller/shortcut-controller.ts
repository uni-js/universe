import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { ContainerType } from '../../server/inventory';
import { ShortcutManager } from '../manager/shortcut-manager';
import { GameController } from '../system/controller';

import * as ServerEvents from '../../server/event/external';

import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { HandleExternalEvent } from '../../event/spec';

@injectable()
export class ShortcutController extends GameController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(ShortcutManager) private shortcutManager: ShortcutManager) {
		super(eventBus);

		this.redirectToBusEvent(this.shortcutManager, Events.SetShortcutIndexEvent, ExternalEvents.SetShortcutIndexEvent);
	}

	@HandleExternalEvent(ServerEvents.UpdateContainer)
	private handleUpdateContainer(event: ServerEvents.UpdateContainer) {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.containerId, event.updateData, event.isFullUpdate);
		}
	}
}
