import { inject, injectable } from 'inversify';
import { ClientSideManager } from '@uni.js/client';
import { PlayerMgr, PlayerMgrEvents } from './player-mgr';
import { HandleEvent } from '@uni.js/event';
import { AttachUsingState } from '../ui-states/using';

@injectable()
export class AttachUsingManager extends ClientSideManager {
	private useTicks = 0;

	constructor(@inject(PlayerMgr) private playerMgr: PlayerMgr, @inject(AttachUsingState) private attachUsingState: AttachUsingState) {
		super();
	}

	@HandleEvent('playerMgr', 'ToggleUsingEvent')
	private onToggleUsing(event: PlayerMgrEvents['ToggleUsingEvent']) {
		if (event.startOrEnd) {
			this.attachUsingState.isUsing = true;
		} else {
			this.attachUsingState.isUsing = false;
			this.attachUsingState.power = 0;
			this.useTicks = 0;
		}
	}

	doUpdateTick() {}

	doFixedUpdateTick() {
		if (this.attachUsingState.isUsing) {
			this.useTicks++;
			this.attachUsingState.power = Math.min(1, this.useTicks / 100);
		}
	}
}
