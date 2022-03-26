import { inject, injectable } from 'inversify';
import { EventBusClient } from '@uni.js/client';
import { PickDropMgr } from '../managers/pick-drop-mgr';
import * as ExternalEvents from '../event';
import { ClientSideController } from '@uni.js/client';
import { EmitLocalEvent } from '@uni.js/event';

@injectable()
export class PickDropController extends ClientSideController {
	constructor(@inject(EventBusClient) eventBus: EventBusClient, @inject(PickDropMgr) private pickDropMgr: PickDropMgr) {
		super(eventBus);
	}

	@EmitLocalEvent('pickDropMgr', 'DropItemEvent')
	@EmitLocalEvent('pickDropMgr', 'PickItemEvent')
	private emitLocalEvent() {}
}
