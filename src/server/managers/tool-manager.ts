import { HandleEvent } from '@uni.js/event';
import { ServerSideManager } from '@uni.js/server';
import { PlayerManagerEvents } from './player-manager';

export class ToolManager extends ServerSideManager {
	constructor() {
		super();
	}

	@HandleEvent('playerManager', 'ToggleUsingEvent')
	private onActorToggleUsing(event: PlayerManagerEvents['ToggleUsingEvent']) {}
}
