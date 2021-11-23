import { inject, injectable } from 'inversify';
import { ServerSideManager } from '../../../framework/server-side/server-manager';

import * as Events from '../../event/internal';

@injectable()
export class BuildingManager extends ServerSideManager {
	constructor() {
		super();
	}

	sendBindingsNearby() {}
}
