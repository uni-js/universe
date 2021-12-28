import { inject, injectable } from 'inversify';
import { ServerSideManager } from '@uni.js/server';

import * as Events from '../../event/internal';

@injectable()
export class BuildingManager extends ServerSideManager {
	constructor() {
		super();
	}

	sendBindingsNearby() {}
}