import { inject, injectable } from 'inversify';
import { HashedStore } from '../../shared/store';
import { HTMLInputProvider, InputKey } from '../input';
import { IGameObject } from '../shared/game-object';
import { StoreManager } from '../shared/manager';
import { UiStore } from '../shared/store';
import { TextureManager } from '../texture';
import { ItemShortcutBar } from '../ui/item-shortcut-bar';
import { IViewport, Viewport } from '../viewport';

@injectable()
export class ShortcutManager extends StoreManager {
	private shortcutBar: ItemShortcutBar;

	constructor(
		@inject(HTMLInputProvider) private input: HTMLInputProvider,
		@inject(UiStore) private uiStore: HashedStore<IGameObject>,
		@inject(Viewport) private viewport: IViewport,
		@inject(TextureManager) textureManager: TextureManager,
	) {
		super();

		this.shortcutBar = new ItemShortcutBar(textureManager, 1, this.viewport.getWorldWidth(), this.viewport.getWorldHeight());
		this.uiStore.add(this.shortcutBar);
	}
	async doTick(tick: number) {
		if (this.input.keyPress(InputKey.NUM_1)) this.shortcutBar.setFocusIndex(0);
		else if (this.input.keyPress(InputKey.NUM_2)) this.shortcutBar.setFocusIndex(1);
		else if (this.input.keyPress(InputKey.NUM_3)) this.shortcutBar.setFocusIndex(2);
		else if (this.input.keyPress(InputKey.NUM_4)) this.shortcutBar.setFocusIndex(3);
		else if (this.input.keyPress(InputKey.NUM_5)) this.shortcutBar.setFocusIndex(4);
	}
}
