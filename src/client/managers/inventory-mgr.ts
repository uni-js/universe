import { inject, injectable } from 'inversify';
import { ClientSideManager } from '@uni.js/client';

import { HTMLInputProvider, InputKey } from '@uni.js/html-input';
import { BackpackContainerState, ContainerState } from '../ui-states/inventory';
import { InventoryBlockState, ShortcutContainerState } from '../ui-states/inventory';

import { UIEventBus } from '@uni.js/ui';
import { HandleEvent } from '@uni.js/event';
import type { DropInfo } from '../components/item-block';
import { ItemType } from '../../server/types/item';
import {
	BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER,
	ContainerType,
	ContainerUpdateData,
	ContainerUpdateDataUnit,
} from '../../server/types/container';

export interface ContainerMgrEvents {
	ContainerMoveBlockEvent: DropInfo;
	SetShortcutIndexEvent: {
		containerId: number;
		indexAt: number;
		itemType: ItemType;
	};
}

export class ContainerMgr extends ClientSideManager<ContainerMgrEvents> {
	constructor(protected container: ContainerState, protected input: HTMLInputProvider, protected uiEventBus: UIEventBus) {
		super();
	}

	@HandleEvent('uiEventBus', 'ContainerMoveBlock')
	private onContainerMoveBlock(dropInfo: DropInfo) {
		this.emit('ContainerMoveBlockEvent', dropInfo);
	}

	updateBlock(updateDataUnit: ContainerUpdateDataUnit) {
		const block = this.container.blocks[updateDataUnit.index];
		if (!block) return;
		block.itemType = updateDataUnit.itemType;
		block.itemCount = updateDataUnit.count;

		this.handleBlocksUpdated();
	}

	/**
	 * set blocks data
	 */
	updateBlocks(containerId: number, updateData: ContainerUpdateData, isFullUpdate: boolean) {
		this.container.containerId = containerId;

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

		if (!this.container.firstUpdated) {
			this.container.firstUpdated = true;
			this.handleFirstUpdated();
		}

		this.handleBlocksUpdated();
	}

	handleFirstUpdated() {}
	handleBlocksUpdated() {}
}

@injectable()
export class BackpackMgr extends ContainerMgr {
	constructor(
		@inject(BackpackContainerState) private backpack: BackpackContainerState,
		@inject(HTMLInputProvider) input: HTMLInputProvider,
		@inject(UIEventBus) uiEventBus: UIEventBus,
	) {
		super(backpack, input, uiEventBus);
		this.initBlocks();
	}

	private initBlocks() {
		const blocks: InventoryBlockState[] = [];
		for (let i = 0; i < BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER; i++) {
			const block = new InventoryBlockState();
			block.containerType = ContainerType.BACKPACK_CONTAINER;
			block.itemType = ItemType.EMPTY;
			block.index = i;
			blocks.push(block);
		}
		this.backpack.blocks = blocks;
	}

	doFixedUpdateTick() {
		if (this.input.keyDown(InputKey.E)) {
			this.uiEventBus.emit('toggleBackpack', {});
		}
	}
}

@injectable()
export class ShortcutMgr extends ContainerMgr {
	constructor(
		@inject(HTMLInputProvider) input: HTMLInputProvider,
		@inject(ShortcutContainerState) private shortcut: ShortcutContainerState,
		@inject(UIEventBus) uiEventBus: UIEventBus,
	) {
		super(shortcut, input, uiEventBus);

		this.initBlocks();
	}

	handleFirstUpdated() {
		this.setCurrentIndex(0, true);
	}

	handleBlocksUpdated() {
		this.emitOutCurrentIndex();
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
		if (dirty) {
			this.emitOutCurrentIndex();
		}
	}

	private emitOutCurrentIndex() {
		const indexAt = this.shortcut.currentIndexAt;
		const block = this.shortcut.blocks[indexAt];
		this.emit('SetShortcutIndexEvent', {
			itemType: block.itemType,
			indexAt,
			containerId: this.shortcut.containerId,
		});
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
