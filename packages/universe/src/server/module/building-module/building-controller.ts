import * as ExternalEvents from '../../event';

import * as ClientEvents from '../../../client/event';

import { inject, injectable } from 'inversify';
import { EventBusServer } from '@uni.js/server';
import { ServerSideController } from '@uni.js/server';

@injectable()
export class BuildingController extends ServerSideController {
	constructor(@inject(EventBusServer) eventBus: EventBusServer) {
		super(eventBus);
	}
}
