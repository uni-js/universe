import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../event/bus-client';
import { SetShortcutIndexEvent } from '../../event/client-side';
import { UpdateContainer } from '../../event/server-side';
import { ContainerType } from '../../server/inventory';
import { GameEvent } from '../event';
import { ShortcutManager } from '../manager/shortcut-manager';

@injectable()
export class ShortcutController {
	constructor(
		@inject(EventBusClient) private eventBus: EventBusClient,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,
	) {
		this.eventBus.on(UpdateContainer.name, this.handleUpdateContainer);
		this.shortcutManager.on(GameEvent.SetShortcutIndexEvent, this.onSetShortcutIndex);
	}
	private onSetShortcutIndex = (indexAt: number, containerId: number) => {
		const event = new SetShortcutIndexEvent(containerId, indexAt);
		this.eventBus.emitEvent(event);
	};
	private handleUpdateContainer = (event: UpdateContainer) => {
		if (event.containerType == ContainerType.SHORTCUT_CONTAINER) {
			this.shortcutManager.updateBlocks(event.containerId, event.updateData);
		}
	};
}
