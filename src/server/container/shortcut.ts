import { PlayerContainer } from './player-container';
import type { Player } from '../player/player';
import type { Server } from '../server';
import { ContainerBlock } from './container';
import type { Item } from '../item/item';
import { ContainerType } from './container-type';
import { ItemType } from '../item/item-type';

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

	setItem(index: number, itemType: ItemType, count: number): void {
		super.setItem(index, itemType, count);
		if(index === this.currIndex) {
			this.holdBlock(this.getBlock(index));
		}
	}

	clearItem(index: number): void {
		super.clearItem(index);
		if (this.holdingBlock) {
			this.unholdBlock();
		}
	}

	setCurrentIndex(index: number) {
		if (this.currIndex === index) {
			return;
		}
		this.currIndex !== undefined && this.unholdBlock();
		this.holdBlock(this.getBlock(index));

		this.currIndex = index;
	}

	getCurrentIndex() {
		return this.currIndex;
	}

	getCurrentBlock() {
		return this.holdingBlock;
	}

	getCurrentItem() {
		return this.holdingItem;
	}

	private holdBlock(block: ContainerBlock) {
		if (this.holdingBlock) {
			return;
		}

		this.holdingBlock = block;
		this.holdingItem = block.getItem();
		this.holdingItem.hold();
	}

	unholdBlock() {
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

	doTick(): void {
		this.holdingItem && this.holdingItem.doTick();
	}
}
