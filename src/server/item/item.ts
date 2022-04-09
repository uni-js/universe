import type { Shortcut } from '../container/shortcut';
import type { World } from '../land/world';
import type { Server } from '../server';
import type { ItemType } from './item-type';

export abstract class Item {
	protected server: Server;
	protected world: World;
	protected useTicks: number = 0;
	protected isUsing: boolean = false;
	constructor(protected shortcut: Shortcut) {
		this.server = this.shortcut.getServer();
		this.world = this.server.getWorld();
	}

	abstract getType(): ItemType;
	abstract hold(): void;
	abstract unhold(): void;

	startUsing() {
		this.useTicks = 0;
		this.isUsing = true;

	}

	stopUsing() {
		this.isUsing = false;
	}

	doTick() {
		if (this.isUsing) {
			this.useTicks++;
		}
	}
}
