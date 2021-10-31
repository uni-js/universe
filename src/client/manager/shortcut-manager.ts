import { inject, injectable } from 'inversify';
import { ContainerUpdateData, ContainerUpdateDataUnit, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from '../../server/inventory';
import { HTMLInputProvider, InputKey } from '../input';
import { ClientSideManager } from '../../framework/client-manager';
import { ItemType } from '../../server/item';
import * as Events from '../event/internal';
import { InventoryBlockState, ShortcutContainerState } from '../ui/state';

@injectable()
export class ShortcutManager extends ClientSideManager {
	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@inject(ShortcutContainerState) private shortcut: ShortcutContainerState,
	) {
		super();

		this.initBlocks();
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
	 * 获取快捷栏当前选中的格子
	 */
	getCurrent() {
		return this.shortcut.blocks[this.shortcut.currentIndexAt];
	}

	/**
	 * 设置单个格子的数据
	 */
	updateBlock(updateDataUnit: ContainerUpdateDataUnit) {
		const block = this.shortcut.blocks[this.shortcut.currentIndexAt];
		if (!block) return;
		block.itemType = updateDataUnit.itemType;
		block.itemCount = updateDataUnit.count;
	}

	/**
	 * 批量设置格子的数据
	 */
	updateBlocks(containerId: number, updateData: ContainerUpdateData, isFullUpdate: boolean) {
		this.shortcut.containerId = containerId;
		this.shortcut.firstUpdated = true;

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
			this.shortcut.blocks = blocks;
		} else {
			blocks.forEach((block) => {
				const source = this.shortcut.blocks[block.index];

				source.itemType = block.itemType;
				source.itemCount = block.itemCount;

				this.shortcut.blocks[block.index] = source;
			});
		}
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
	async doTick(tick: number) {
		this.updateShortcutIndex();
	}
}
