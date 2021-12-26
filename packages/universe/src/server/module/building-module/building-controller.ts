import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

import * as ClientEvents from '../../../client/event/external';

import { inject, injectable } from 'inversify';
import { EventBusServer } from '@uni.js/server';
import { HandleExternalEvent } from '@uni.js/event';
import { ServerSideController } from '@uni.js/server';

@injectable()
export class BuildingController extends ServerSideController {
	constructor(@inject(EventBusServer) eventBus: EventBusServer) {
		super(eventBus);
	}
}
