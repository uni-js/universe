import { createClientSideModule } from '@uni.js/client';
import { PickDropController } from './pick-drop-controller';
import { PickDropManager } from './pick-drop-manager';
import { InvetoryController } from './inventory-controller';
import { ShortcutManager, BackpackManager } from './inventory-manager';
import { BackpackContainerState, InventoryBlockState, ShortcutContainerState } from './ui-state';

export const InventoryModule = createClientSideModule({
	controllers: [PickDropController, InvetoryController],
	managers: [PickDropManager, ShortcutManager, BackpackManager],
	uiStates: [ShortcutContainerState, InventoryBlockState, BackpackContainerState],
});
