import { inject, injectable } from 'inversify';
import { HTMLInputProvider, InputKey } from '../input';
import { StoreManager } from '../shared/manager';
import { TextureContainer } from '../texture';
import { PlayerInventory } from '../ui/inventory';
import { Viewport } from '../viewport';

@injectable()
export class InventoryManager extends StoreManager {
	private playerInventory;

	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@inject(Viewport) private viewport: Viewport,
		@inject(TextureContainer) private texture: TextureContainer,
	) {
		super();

		this.playerInventory = new PlayerInventory(this.texture, this.viewport.getWorldWidth(), this.viewport.getWorldHeight());
	}
	async doTick(tick: number) {
		if (this.input.keyDown(InputKey.E)) {
			this.playerInventory.toggleVisible();
		}
	}
}
