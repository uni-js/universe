import { ItemType } from '../item/item-type';
import type { Player } from '../player/player';
import type { Server } from '../server';
import { ActiveContainer } from './active-container';
import { Container } from './container';

export abstract class PlayerContainer extends ActiveContainer {
	private player: Player;
	protected allDirty = true;
	protected dirtyBlocks = new Set<number>();

	constructor(player: Player, server: Server) {
		super(server);

		this.player = player;
	}

	abstract getSize(): number;

	getPlayer() {
		return this.player;
	}

	setItem(index: number, itemType: ItemType, count: number): void {
		super.setItem(index, itemType, count);

		this.dirtyBlocks.add(index);
	}

	clearItem(index: number): void {
		super.clearItem(index);

		this.dirtyBlocks.add(index);
	}

	moveTo(index: number, to: Container, toIndex: number): void {
		super.moveTo(index, to, toIndex);

		if (to instanceof PlayerContainer) {
			to.allDirty = true;
		}

		this.allDirty = true;
	}

	private cleanDirty() {
		this.allDirty = false;
		this.dirtyBlocks.clear();
	}

	syncDirtyToPlayer() {
		if (this.allDirty) {
			this.syncContainerTo(this.player);
		} else {
			for (const index of this.dirtyBlocks.values()) {
				this.syncBlockTo(this.player, index);
			}
		}
		this.cleanDirty();
	}

}
