import { inject, injectable } from 'inversify';
import { ActorType } from '../../server/actor/spec';
import { ItemType } from '../../server/item';
import { BOW_DRAGGING_MAX_TICKS, BOW_RELEASING_MIN_TICKS } from '../../server/manager/bow-manager';
import { SERVER_TICKS_MULTIPLE } from '../../server/shared/server';
import { GameManager } from '../../framework/client-manager';
import { ActorManager } from './actor-manager';
import { PlayerManager } from './player-manager';
import { ShortcutManager } from './shortcut-manager';
import { HandleInternalEvent } from '../../framework/event';
import { BowUsingState } from '../ui/state';

import * as Events from '../event/internal';

@injectable()
export class BowManager extends GameManager {
	private useTicks = 0;
	constructor(
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,

		@inject(BowUsingState) private bowUsingState: BowUsingState,
	) {
		super();
	}

	@HandleInternalEvent('actorManager', Events.ActorToggleUsingEvent)
	private onActorToggleUsing(event: Events.ActorToggleUsingEvent) {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (actor.actorType !== ActorType.BOW) return;
		if (actor.attaching.actorId !== this.playerManager.getCurrentPlayer().getServerId()) return;

		if (event.startOrEnd) {
			this.bowUsingState.isUsing = true;
		} else {
			this.bowUsingState.isUsing = false;
			this.bowUsingState.power = 0;
			this.useTicks = 0;
		}
	}

	@HandleInternalEvent('shortcutManager', Events.ActorToggleUsingEvent)
	private onShortcutSetIndex(event: Events.SetShortcutIndexEvent) {
		if (event.itemType !== ItemType.BOW) {
			this.bowUsingState.isUsing = false;
			this.playerManager.canRotateAttachment = false;
		} else {
			this.playerManager.canRotateAttachment = true;
		}
	}

	async doTick() {
		if (this.bowUsingState.isUsing) {
			this.useTicks++;
			this.bowUsingState.canRelease = this.useTicks > BOW_RELEASING_MIN_TICKS * SERVER_TICKS_MULTIPLE;
			this.bowUsingState.power = Math.min(1, this.useTicks / (BOW_DRAGGING_MAX_TICKS * SERVER_TICKS_MULTIPLE));
		}
	}
}
