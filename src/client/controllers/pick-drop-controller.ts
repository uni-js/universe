import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { PickDropManager } from '../managers/pick-drop-manager';
import * as ExternalEvents from '../event';
import { ClientSideController } from '@uni.js/client';
import { EmitLocalEvent } from '@uni.js/event';

@injectable()
export class PickDropController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(PickDropManager) private pickDropManager: PickDropManager) {
		super(eventBus);
	}

	@EmitLocalEvent('pickDropManager', 'DropItemEvent')
	@EmitLocalEvent('pickDropManager', 'PickItemEvent')
	private emitLocalEvent() {}
}
