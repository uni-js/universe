import { inject, injectable } from 'inversify';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { ContainerUpdateData, ContainerUpdateDataUnit, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from '../../shared/inventory';
import { ItemType } from '../../shared/item';
import { HTMLInputProvider, InputKey } from '../input';
import { GameManager } from '../shared/manager';
import { ShortcutContainerInfo, InventoryBlockInfo } from '../shared/store';

@injectable()
export class ShortcutManager extends GameManager {
	private shortcut: ShortcutContainerInfo;
	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@injectCollection(ShortcutContainerInfo) private shortcutStore: ICollection<ShortcutContainerInfo>,
		@injectCollection(InventoryBlockInfo) private blocksList: ICollection<InventoryBlockInfo>,
	) {
		super();

		this.shortcut = new ShortcutContainerInfo();
		this.shortcutStore.insertOne(this.shortcut);

		this.initBlocks();
	}

	private initBlocks() {
		const blocks: InventoryBlockInfo[] = [];
		for (let i = 0; i < BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER; i++) {
			const block = new InventoryBlockInfo();
			block.containerType = ContainerType.SHORTCUT_CONTAINER;
			block.itemType = ItemType.EMPTY;
			block.index = i;
			blocks.push(block);
		}
		this.blocksList.insert(blocks);
	}

	/**
	 * 获取快捷栏当前选中的格子
	 */
	getCurrent() {
		return this.blocksList.findOne({ containerType: ContainerType.SHORTCUT_CONTAINER, index: this.shortcut.currentIndexAt });
	}

	/**
	 * 设置单个格子的数据
	 */
	updateBlock(updateDataUnit: ContainerUpdateDataUnit) {
		const found = this.blocksList.findOne({ index: updateDataUnit.index });
		if (!found) return;
		found.itemType = updateDataUnit.itemType;
		found.itemCount = updateDataUnit.count;

		this.blocksList.update(found);
	}

	/**
	 * 批量设置全部格子的数据
	 */
	updateBlocks(updateData: ContainerUpdateData) {
		this.blocksList.removeWhere({ containerType: ContainerType.SHORTCUT_CONTAINER });
		const blocks: InventoryBlockInfo[] = [];
		for (const unit of updateData.units) {
			const block = new InventoryBlockInfo();
			block.containerType = ContainerType.SHORTCUT_CONTAINER;
			block.itemType = unit.itemType;
			block.index = unit.index;
			block.itemCount = unit.count;

			blocks[unit.index] = block;
		}
		this.blocksList.insert(blocks);
	}

	private updateShortcutIndex() {
		let isDirty = true;

		if (this.input.keyDown(InputKey.NUM_1)) {
			this.shortcut.currentIndexAt = 0;
		} else if (this.input.keyDown(InputKey.NUM_2)) {
			this.shortcut.currentIndexAt = 1;
		} else if (this.input.keyDown(InputKey.NUM_3)) {
			this.shortcut.currentIndexAt = 2;
		} else if (this.input.keyDown(InputKey.NUM_4)) {
			this.shortcut.currentIndexAt = 3;
		} else if (this.input.keyDown(InputKey.NUM_5)) {
			this.shortcut.currentIndexAt = 4;
		} else {
			isDirty = false;
		}

		if (isDirty) {
			this.shortcutStore.update(this.shortcut);
		}
	}
	async doTick(tick: number) {
		this.updateShortcutIndex();
	}
}
