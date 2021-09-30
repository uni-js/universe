import { inject, injectable } from 'inversify';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { HTMLInputProvider, InputKey } from '../input';
import { GameManager } from '../shared/manager';
import { PlayerInventoryInfo } from '../shared/store';

@injectable()
export class ShortcutManager extends GameManager {
	private inventory: PlayerInventoryInfo;
	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@injectCollection(PlayerInventoryInfo) private inventoryList: ICollection<PlayerInventoryInfo>,
	) {
		super();

		this.inventory = new PlayerInventoryInfo();
		this.inventoryList.insertOne(this.inventory);
	}
	private updateShortcutIndex() {
		let isDirty = true;

		if (this.input.keyDown(InputKey.NUM_1)) {
			this.inventory.currentIndexAt = 0;
		} else if (this.input.keyDown(InputKey.NUM_2)) {
			this.inventory.currentIndexAt = 1;
		} else if (this.input.keyDown(InputKey.NUM_3)) {
			this.inventory.currentIndexAt = 2;
		} else if (this.input.keyDown(InputKey.NUM_4)) {
			this.inventory.currentIndexAt = 3;
		} else if (this.input.keyDown(InputKey.NUM_5)) {
			this.inventory.currentIndexAt = 4;
		} else {
			isDirty = false;
		}

		if (isDirty) {
			this.inventoryList.update(this.inventory);
		}
	}
	async doTick(tick: number) {
		this.updateShortcutIndex();
	}
}
