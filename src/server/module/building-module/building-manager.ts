import { inject, injectable } from 'inversify';
import { ServerSideManager } from '@uni.js/server';

@injectable()
export class BuildingManager extends ServerSideManager {
	constructor() {
		super();
	}

	sendBindingsNearby() {}
}
