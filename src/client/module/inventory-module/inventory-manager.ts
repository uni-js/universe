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
import { UIEventBus } from '../../../framework/client-side/user-interface/hooks';

export class ContainerManager extends ClientSideManager {
	constructor(protected container: ContainerState, protected input: HTMLInputProvider, protected uiEventBus: UIEventBus) {
		super();

		this.uiEventBus.on('ContainerMoveBlock', this.onContainerMoveBlock.bind(this));
	}

	private onContainerMoveBlock(sourceContainerId: number, sourceIndex: number, targetContainerId: number, targetIndex: number) {
		this.emitEvent(Events.ContainerMoveBlockEvent, {
			sourceContainerId,
			sourceIndex,
			targetContainerId,
			targetIndex,
		});
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
	}

	handleFirstUpdated() {}
}

@injectable()
export class BackpackManager extends ContainerManager {
	constructor(
		@inject(BackpackContainerState) private backpack: BackpackContainerState,
		@inject(HTMLInputProvider) input: HTMLInputProvider,
		@inject(UIEventBus) uiEventBus: UIEventBus,
	) {
		super(backpack, input, uiEventBus);
	}

	doFixedUpdateTick() {
		if (this.input.keyDown(InputKey.E)) {
			this.uiEventBus.emit('toggleBackpack');
		}
	}
}

@injectable()
export class ShortcutManager extends ContainerManager {
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
