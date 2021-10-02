import { inject, injectable } from 'inversify';
import { HTMLInputProvider, InputKey } from '../input';
import { GameManager } from '../shared/manager';
import { TextureProvider } from '../texture';
import { PlayerInventory } from '../ui/inventory';
import { Viewport } from '../viewport';

@injectable()
export class InventoryManager extends GameManager {
	private playerInventory;

	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@inject(Viewport) private viewport: Viewport,
		@inject(TextureProvider) private texture: TextureProvider,
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
