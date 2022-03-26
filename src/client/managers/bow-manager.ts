import { inject, injectable } from 'inversify';
import { SERVER_TICKS_MULTIPLE } from '../../server/types/server';
import { ClientSideManager } from '@uni.js/client';
import { ActorManager, ActorManagerEvents } from './actor-manager';
import { PlayerManager, PlayerManagerEvents } from './player-manager';
import { ContainerManagerEvents, ShortcutManager } from './inventory-manager';
import { HandleEvent } from '@uni.js/event';
import { BowUsingState } from '../ui-states/bow';
import { ActorType, AttachType } from '../../server/types/actor';
import { ItemType } from '../../server/types/item';
import { BOW_DRAGGING_MAX_TICKS, BOW_RELEASING_MIN_TICKS } from '../../server/types/tools';

@injectable()
export class BowManager extends ClientSideManager {
	private useTicks = 0;
	private useUpdateTicks = 0;

	constructor(
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,

		@inject(BowUsingState) private bowUsingState: BowUsingState,
	) {
		super();
	}

	@HandleEvent('playerManager', 'ToggleUsingEvent')
	private onToggleUsing(event: PlayerManagerEvents['ToggleUsingEvent']) {
		const player = this.playerManager.getCurrentPlayer();
		const actor = this.actorManager.getObjectById(player.getAttachment(AttachType.RIGHT_HAND).actorId);
		if (actor.actorType !== ActorType.BOW) return;

		if (event.startOrEnd) {
			this.bowUsingState.isUsing = true;
		} else {
			this.bowUsingState.isUsing = false;
			this.bowUsingState.power = 0;
			this.useTicks = 0;
		}
	}

	@HandleEvent('shortcutManager', 'SetShortcutIndexEvent')
	private onShortcutSetIndex(event: ContainerManagerEvents['SetShortcutIndexEvent']) {
		if (event.itemType !== ItemType.BOW) {
			this.bowUsingState.isUsing = false;
			this.playerManager.settingAimTarget = false;
		} else {
			this.playerManager.settingAimTarget = true;
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
