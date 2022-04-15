import { itemFactory } from '../item/item-factory';
import { ItemType } from '../item/item-type';
import type { Server } from '../server';
import { ContainerType } from './container-type';

const BLOCK_MAX_SIZE = 64;

export interface ContainerDataUnit {
	index: number;
	itemType: ItemType;
	count: number;
}

export interface ContainerData {
	units: ContainerDataUnit[];
}

export class ContainerBlock {
	private store: ItemType = ItemType.EMPTY;
	private count: number = 0;
	private maxSize = BLOCK_MAX_SIZE;

	constructor(private index: number, private container: Container) {}

	setItem(item: ItemType, count: number) {
		if (count <= 0 || count > this.maxSize) {
			return;
		}
		this.store = item;
		this.count = count;
	}

	getSpareSize() {
		return this.maxSize - this.count;
	}

	getItem() {
		return itemFactory.getNewItem(this.getItemType(), this.container);
	}

	getItemType() {
		return this.store;
	}

	getCount() {
		return this.count;
	}

	getIndex() {
		return this.index;
	}

	clear() {
		this.store = ItemType.EMPTY;
		this.count = 0;
	}

	isEmpty() {
		return this.store === ItemType.EMPTY;
	}
}

export abstract class Container {
	protected usedSize: number = 0;
	protected blocks: ContainerBlock[] = [];

	constructor(private server: Server) {
		for (let i = 0; i < this.getSize(); i++) {
			this.blocks.push(new ContainerBlock(i, this));
		}
	}

	abstract getSize(): number;

	getType() {
		return ContainerType.SIMPLE;
	}

	getServer() {
		return this.server;
	}

	isEmpty() {
		return this.usedSize === 0;
	}

	isFull() {
		return this.getSpareSize() === 0;
	}

	getSpareSize() {
		return this.getSize() - this.usedSize;
	}

	isBlockEmpty(index: number) {
		return this.blocks[index].isEmpty();
	}

	getItemType(index: number): ItemType {
		return this.blocks[index].getItemType();
	}

	getBlock(index: number) {
		return this.blocks[index];
	}

	setItem(index: number, item: ItemType, count: number): void {
		if (this.isBlockEmpty(index) && item !== undefined) {
			this.usedSize += 1;
		}
		const block = this.blocks[index];
		block.setItem(item, count);
	}

	addItem(item: ItemType, count: number) {
		if (this.isFull()) {
			return false;
		}

		for (let i = 0; i < this.getSize(); i++) {
			const block = this.getBlock(i);
			if ((block.getItemType() === item && block.getSpareSize() > count) || block.isEmpty()) {
				this.setItem(i, item, block.getCount() + count);
				break;
			}
		}

		return true;
	}

	clearItem(index: number): void {
		if (!this.isBlockEmpty(index)) {
			this.usedSize -= 1;
		}
		this.blocks[index].clear();
	}

	moveTo(index: number, to: Container, toIndex: number) {
		if (this.isBlockEmpty(index)) {
			return;
		}

		if (!to.isBlockEmpty(toIndex)) {
			return;
		}

		const item = this.getItemType(index);
		to.setItem(toIndex, item, this.blocks[index].getCount());
		this.clearItem(index);
	}
}
