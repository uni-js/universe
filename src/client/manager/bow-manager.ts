import { inject, injectable } from 'inversify';
import { ActorType } from '../../server/actor/spec';
import { ItemType } from '../../server/item';
import { BOW_DRAGGING_MAX_TICKS, BOW_RELEASING_MIN_TICKS } from '../../server/manager/bow-manager';
import { SERVER_TICKS_MULTIPLE } from '../../server/shared/server';
import { injectCollection, NotLimitCollection } from '../../shared/database/memory';
import { GameManager } from '../system/manager';
import { BowUsingInfo } from '../shared/store';
import { ActorManager } from './actor-manager';
import { PlayerManager } from './player-manager';
import { ShortcutManager } from './shortcut-manager';
import * as Events from '../event/internal';

@injectable()
export class BowManager extends GameManager {
	private bowUsingInfo: BowUsingInfo;
	private useTicks = 0;
	constructor(
		@inject(ActorManager) private actorManager: ActorManager,
		@inject(PlayerManager) private playerManager: PlayerManager,
		@inject(ShortcutManager) private shortcutManager: ShortcutManager,

		@injectCollection(BowUsingInfo) private bowInfoStore: NotLimitCollection<BowUsingInfo>,
	) {
		super();
		this.bowUsingInfo = new BowUsingInfo();
		this.bowInfoStore.insertOne(this.bowUsingInfo);

		this.actorManager.onEvent(Events.ActorToggleUsingEvent, this.onActorToggleUsing);
		this.shortcutManager.onEvent(Events.SetShortcutIndexEvent, this.onShortcutSetIndex);
	}
	private onActorToggleUsing = (event: Events.ActorToggleUsingEvent) => {
		const actor = this.actorManager.getObjectById(event.actorId);
		if (actor.getActorType() !== ActorType.BOW) return;
		if (actor.getAttaching().actorId !== this.playerManager.getCurrentPlayer().getServerId()) return;

		if (event.startOrEnd) {
			this.bowUsingInfo.isUsing = true;
		} else {
			this.bowUsingInfo.isUsing = false;
			this.bowUsingInfo.power = 0;
			this.useTicks = 0;
		}

		this.bowInfoStore.update(this.bowUsingInfo);
	};
	private onShortcutSetIndex = (event: Events.SetShortcutIndexEvent) => {
		if (event.itemType !== ItemType.BOW) {
			this.bowUsingInfo.isUsing = false;
			this.bowInfoStore.update(this.bowUsingInfo);
		}
	};
	async doTick() {
		if (this.bowUsingInfo.isUsing) {
			this.useTicks++;
			this.bowUsingInfo.canRelease = this.useTicks > BOW_RELEASING_MIN_TICKS * SERVER_TICKS_MULTIPLE;
			this.bowUsingInfo.power = Math.min(1, this.useTicks / (BOW_DRAGGING_MAX_TICKS * SERVER_TICKS_MULTIPLE));
			this.bowInfoStore.update(this.bowUsingInfo);
		}
	}
}
