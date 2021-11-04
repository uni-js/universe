import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../../framework/bus-client';
import { PickDropManager } from './pick-drop-manager';
import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';
import { ClientSideController } from '../../../framework/client-controller';

@injectable()
export class PickDropController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(PickDropManager) private pickDropManager: PickDropManager) {
		super(eventBus);

		this.redirectToBusEvent(this.pickDropManager, Events.DropItemEvent, ExternalEvents.DropItemEvent);
	}
}
