import { inject, injectable } from 'inversify';
import { injectCollection, NotLimitCollection } from '../../shared/database/memory';
import { ContainerUpdateData, ContainerUpdateDataUnit, BLOCKS_PER_PLAYER_SHORTCUT_CONTAINER, ContainerType } from '../../server/inventory';
import { HTMLInputProvider, InputKey } from '../input';
import { GameManager } from '../shared/manager';
import { ShortcutContainerInfo, InventoryBlockInfo } from '../shared/store';
import { ItemType } from '../../server/item';
import { GameEvent } from '../event';

@injectable()
export class ShortcutManager extends GameManager {
	private shortcut: ShortcutContainerInfo;
	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@injectCollection(ShortcutContainerInfo) private shortcutStore: NotLimitCollection<ShortcutContainerInfo>,
		@injectCollection(InventoryBlockInfo) private blocksList: NotLimitCollection<InventoryBlockInfo>,
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
	 * 批量设置格子的数据
	 */
	updateBlocks(containerId: number, updateData: ContainerUpdateData, isFullUpdate: boolean) {
		this.shortcut.containerId = containerId;
		this.shortcut.firstUpdated = true;

		const blocks: InventoryBlockInfo[] = [];
		for (const unit of updateData.units) {
			const block = new InventoryBlockInfo();
			block.containerType = ContainerType.SHORTCUT_CONTAINER;
			block.itemType = unit.itemType;
			block.index = unit.index;
			block.itemCount = unit.count;

			blocks[unit.index] = block;
		}

		this.shortcutStore.update(this.shortcut);
		if (isFullUpdate) {
			this.blocksList.removeWhere({ containerType: ContainerType.SHORTCUT_CONTAINER });
			this.blocksList.insert(blocks);
		} else {
			blocks.forEach((block) => {
				this.blocksList.findAndUpdate(
					{
						containerType: ContainerType.SHORTCUT_CONTAINER,
						index: block.index,
					},
					(target) => {
						target.itemType = block.itemType;
						target.itemCount = block.itemCount;
					},
				);
			});
		}
	}

	setCurrentIndex(indexAt: number, dirty = true) {
		if (!this.shortcut.firstUpdated) return;

		this.shortcut.currentIndexAt = indexAt;
		this.shortcutStore.update(this.shortcut);

		const block = this.blocksList.findOne({ containerType: ContainerType.SHORTCUT_CONTAINER, index: indexAt });

		if (dirty) {
			this.emit(GameEvent.SetShortcutIndexEvent, indexAt, this.shortcut.containerId, block);
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
