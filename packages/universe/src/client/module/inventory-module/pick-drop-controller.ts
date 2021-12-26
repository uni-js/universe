import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { PickDropManager } from './pick-drop-manager';
import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { ClientSideController } from '@uni.js/client';

@injectable()
export class PickDropController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(PickDropManager) private pickDropManager: PickDropManager) {
		super(eventBus);

		this.redirectToBusEvent(this.pickDropManager, Events.DropItemEvent, ExternalEvents.DropItemEvent);
		this.redirectToBusEvent(this.pickDropManager, Events.PickItemEvent, ExternalEvents.PickItemEvent);
	}
}
