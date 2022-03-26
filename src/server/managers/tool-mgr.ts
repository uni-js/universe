import { HandleEvent } from '@uni.js/event';
import { ServerSideManager } from '@uni.js/server';
import { PlayerMgrEvents } from './player-mgr';

export class ToolMgr extends ServerSideManager {
	constructor() {
		super();
	}

	@HandleEvent('playerMgr', 'ToggleUsingEvent')
	private onActorToggleUsing(event: PlayerMgrEvents['ToggleUsingEvent']) {}
}
