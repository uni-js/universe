import * as Events from '../../event/internal';
import * as ExternalEvents from '../../event/external';

import * as ClientEvents from '../../../client/event/external';

import { inject, injectable } from 'inversify';
import { EventBusServer } from '../../../framework/server-side/bus-server';
import { HandleExternalEvent } from '../../../framework/event';
import { ServerSideController } from '../../../framework/server-side/server-controller';

@injectable()
export class BuildingController extends ServerSideController {
	constructor(@inject(EventBusServer) eventBus: EventBusServer) {
		super(eventBus);
	}
}
