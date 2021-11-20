import { inject, injectable } from 'inversify';
import { ClientSideManager } from '../../../framework/client-side/client-manager';

import { HTMLInputProvider, InputKey } from '../../input';
import { BackpackContainerState, ContainerState } from './ui-state';
import {
	ContainerUpdateData,
	ContainerUpdateDataUnit,
	BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER,
	ContainerType,
} from '../../../server/module/inventory-module/spec';
import { ItemType } from '../../../server/module/inventory-module/item-entity';
import { InventoryBlockState, ShortcutContainerState } from './ui-state';

import * as Events from '../../event/internal';

export class ContainerManager extends ClientSideManager {
	constructor(protected container: ContainerState, protected input: HTMLInputProvider) {
		super();
	}

	updateBlock(updateDataUnit: ContainerUpdateDataUnit) {
		const block = this.container.blocks[updateDataUnit.index];
		if (!block) return;
		block.itemType = updateDataUnit.itemType;
		block.itemCount = updateDataUnit.count;
	}

	/**
	 * set blocks data
	 */
	updateBlocks(containerId: number, updateData: ContainerUpdateData, isFullUpdate: boolean) {
		this.container.containerId = containerId;
		this.container.firstUpdated = true;

		const blocks: InventoryBlockState[] = [];
		for (const unit of updateData.units) {
			const block = new InventoryBlockState();
			block.containerType = ContainerType.SHORTCUT_CONTAINER;
			block.itemType = unit.itemType;
			block.index = unit.index;
			block.itemCount = unit.count;

			blocks[unit.index] = block;
		}

		if (isFullUpdate) {
			this.container.blocks = blocks;
		} else {
			blocks.forEach((block) => {
				const source = this.container.blocks[block.index];

				source.itemType = block.itemType;
				source.itemCount = block.itemCount;

				this.container.blocks[block.index] = source;
			});
		}
	}
}

@injectable()
export class BackpackManager extends ContainerManager {
	constructor(
		@inject(BackpackContainerState) private backpack: BackpackContainerState,
		@inject(HTMLInputProvider) input: HTMLInputProvider,
	) {
		super(backpack, input);
	}

	doFixedUpdateTick() {
		if (this.input.keyDown(InputKey.E)) {
			this.backpack.visible = !this.backpack.visible;
		}
	}
}

@injectable()
export class ShortcutManager extends ContainerManager {
	constructor(
		@inject(HTMLInputProvider) input: HTMLInputProvider,
		@inject(ShortcutContainerState) private shortcut: ShortcutContainerState,
	) {
		super(shortcut, input);

		this.initBlocks();
	}

	/**
	 * set a block data
	 */
	updateCurrentBlock(updateDataUnit: ContainerUpdateDataUnit) {
		const block = this.shortcut.blocks[this.shortcut.currentIndexAt];
		if (!block) return;
		this.updateBlock(updateDataUnit);
	}

	private initBlocks() {
		const blocks: InventoryBlockState[] = [];
		for (let i = 0; i < BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER; i++) {
			const block = new InventoryBlockState();
			block.containerType = ContainerType.SHORTCUT_CONTAINER;
			block.itemType = ItemType.EMPTY;
			block.index = i;
			blocks.push(block);
		}
		this.shortcut.blocks = blocks;
	}

	/**
	 * get current block selected on shortcut
	 */
	getCurrent() {
		return this.shortcut.blocks[this.shortcut.currentIndexAt];
	}

	setCurrentIndex(indexAt: number, dirty = true) {
		if (!this.shortcut.firstUpdated) return;

		this.shortcut.currentIndexAt = indexAt;
		const block = this.shortcut.blocks[indexAt];

		if (dirty) {
			this.emitEvent(Events.SetShortcutIndexEvent, {
				itemType: block.itemType,
				indexAt,
				containerId: this.shortcut.containerId,
			});
		}
	}

	private updateShortcutIndex() {
		if (this.input.keyDown(InputKey.NUM_1)) {
			this.setCurrentIndex(0);
		} else if (this.input.keyDown(InputKey.NUM_2)) {
			this.setCurrentIndex(1);
		} else if (this.input.keyDown(InputKey.NUM_3)) {
			this.setCurrentIndex(2);
		} else if (this.input.keyDown(InputKey.NUM_4)) {
			this.setCurrentIndex(3);
		} else if (this.input.keyDown(InputKey.NUM_5)) {
			this.setCurrentIndex(4);
		}
	}

	doFixedUpdateTick(tick: number) {
		this.updateShortcutIndex();
	}
}
