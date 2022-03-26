import { inject, injectable } from 'inversify';
import { SERVER_TICKS_MULTIPLE } from '../../server/types/server';
import { ClientSideManager } from '@uni.js/client';
import { ActorMgr, ActorMgrEvents } from './actor-manager';
import { PlayerMgr, PlayerMgrEvents } from './player-manager';
import { ContainerMgrEvents, ShortcutMgr } from './inventory-manager';
import { HandleEvent } from '@uni.js/event';
import { BowUsingState } from '../ui-states/bow';
import { ActorType, AttachType } from '../../server/types/actor';
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
		const player = this.playerMgr.getCurrentPlayer();
		const actor = this.actorMgr.getObjectById(player.getAttachment(AttachType.RIGHT_HAND).actorId);
		if (actor.actorType !== ActorType.BOW) return;

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
