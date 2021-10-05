import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { UpdateContainer } from '../../event/server-side';
import { ContainerType } from '../../shared/inventory';
import { ShortcutManager } from '../manager/shortcut-manager';

@injectable()
export class ShortcutService {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,
	) {
		this.eventBus.on(UpdateContainer.name, this.handleUpdateContainer);
	}
	private handleUpdateContainer = (event: UpdateContainer) => {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.updateData);
		}
	};
}
