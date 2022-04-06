import { PlayerContainer } from './player-container';
import type { Player } from '../player/player';
import type { Server } from '../server';
import { ContainerBlock } from './container';
import type { Item } from '../item/item';
import { ContainerType } from './container-type';

export const SHORTCUT_SIZE = 5;

export class Shortcut extends PlayerContainer {
	private holdingBlock: ContainerBlock | undefined;
	private holdingItem: Item;
	private currIndex: number;

	constructor(player: Player, server: Server) {
		super(player, server);
	}

	getType() {
		return ContainerType.SHORTCUT;
	}

	setCurrentIndex(index: number) {
		if (this.currIndex === index) {
			return;
		}
		this.currIndex !== undefined && this.unholdBlock();
		this.holdBlock(this.getBlock(index));

		this.currIndex = index;
	}

	private holdBlock(block: ContainerBlock) {
		if (this.holdingBlock) {
			return;
		}

		this.holdingBlock = block;
		this.holdingItem = block.getItem();
		this.holdingItem.hold();
	}

	private unholdBlock() {
		if (!this.holdingBlock) {
			return;
		}
		this.holdingItem.unhold();
		this.holdingItem = undefined;
		this.holdingBlock = undefined;
	}

	getSize(): number {
		return SHORTCUT_SIZE;
	}
}
