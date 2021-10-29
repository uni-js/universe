import { inject, injectable } from 'inversify';
import { EventBusClient } from '../../framework/bus-client';
import { PickDropManager } from '../manager/pick-drop-manager';
import * as Events from '../event/internal';
import * as ExternalEvents from '../event/external';
import { GameController } from '../../framework/client-controller';

@injectable()
export class PickDropController extends GameController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(PickDropManager) private pickDropManager: PickDropManager) {
		super(eventBus);

		this.redirectToBusEvent(this.pickDropManager, Events.DropItemEvent, ExternalEvents.DropItemEvent);
	}
}
