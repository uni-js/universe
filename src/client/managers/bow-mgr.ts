import { inject, injectable } from 'inversify';
import { SERVER_TICKS_MULTIPLE } from '../../server/types/server';
import { ClientSideManager } from '@uni.js/client';
import { ActorMgr, ActorMgrEvents } from './actor-mgr';
import { PlayerMgr, PlayerMgrEvents } from './player-mgr';
import { ContainerMgrEvents, ShortcutMgr } from './inventory-mgr';
import { HandleEvent } from '@uni.js/event';
import { BowUsingState } from '../ui-states/bow';
import { ActorType } from '../../server/types/actor';
import { ItemType } from '../../server/types/item';
import { BOW_DRAGGING_MAX_TICKS, BOW_RELEASING_MIN_TICKS } from '../../server/types/tools';

@injectable()
export class BowMgr extends ClientSideManager {
	private useTicks = 0;
	private useUpdateTicks = 0;

	constructor(
		@inject(ActorMgr) private actorMgr: ActorMgr,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(ShortcutMgr) private shortcutMgr: ShortcutMgr,

		@inject(BowUsingState) private bowUsingState: BowUsingState,
	) {
		super();
	}

	@HandleEvent('playerMgr', 'ToggleUsingEvent')
	private onToggleUsing(event: PlayerMgrEvents['ToggleUsingEvent']) {
		if (event.actorType !== ActorType.BOW) return;

		if (event.startOrEnd) {
			this.bowUsingState.isUsing = true;
		} else {
			this.bowUsingState.isUsing = false;
			this.bowUsingState.power = 0;
			this.useTicks = 0;
		}
	}

	@HandleEvent('shortcutMgr', 'SetShortcutIndexEvent')
	private onShortcutSetIndex(event: ContainerMgrEvents['SetShortcutIndexEvent']) {
		if (event.itemType !== ItemType.BOW) {
			this.bowUsingState.isUsing = false;
			this.playerMgr.settingAimTarget = false;
		} else {
			this.playerMgr.settingAimTarget = true;
		}
	}

	doUpdateTick() {}

	doFixedUpdateTick() {
		if (this.bowUsingState.isUsing) {
			this.useTicks++;
			this.bowUsingState.power = Math.min(1, this.useTicks / (BOW_DRAGGING_MAX_TICKS * SERVER_TICKS_MULTIPLE));
			this.bowUsingState.canRelease = this.useTicks > BOW_RELEASING_MIN_TICKS * SERVER_TICKS_MULTIPLE;
		}
	}
}
