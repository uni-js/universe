import { HandleEvent } from '@uni.js/event';
import { ServerSideManager } from '@uni.js/server';
import { PlayerMgrEvents } from './player-manager';

export class ToolMgr extends ServerSideManager {
	constructor() {
		super();
	}

	@HandleEvent('playerMgr', 'ToggleUsingEvent')
	private onActorToggleUsing(event: PlayerMgrEvents['ToggleUsingEvent']) {}
}
