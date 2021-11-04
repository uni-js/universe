import { createClientSideModule } from '../../../framework/module';
import { PickDropController } from './pick-drop-controller';
import { PickDropManager } from './pick-drop-manager';
import { ShortcutController } from './shortcut-controller';
import { ShortcutManager } from './shortcut-manager';
import { InventoryBlockState, ShortcutContainerState } from './ui-state';

export const InventoryModule = createClientSideModule({
	controllers: [PickDropController, ShortcutController],
	managers: [PickDropManager, ShortcutManager],
	uiStates: [ShortcutContainerState, InventoryBlockState],
});
