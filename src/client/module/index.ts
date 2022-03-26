import { createClientSideModule } from '@uni.js/client';
import { BowManager } from '../managers/bow-manager';
import { BowUsingState } from '../ui-states/bow';
import { PlayerController } from '../controllers/player-controller';
import { PlayerManager } from '../managers/player-manager';
import { PlayerState } from '../ui-states/player';
import { PickDropController } from '../controllers/pick-drop-controller';
import { PickDropManager } from '../managers/pick-drop-manager';
import { InvetoryController } from '../controllers/inventory-controller';
import { ShortcutManager, BackpackManager } from '../managers/inventory-manager';
import { BackpackContainerState, InventoryBlockState, ShortcutContainerState } from '../ui-states/inventory';
import { ActorController } from '../controllers/actor-controller';
import { ActorManager } from '../managers/actor-manager';
import { ActorFactory } from '../objects/actor-object';
import { actorFactory } from '../factory/actor';
import { LandController } from '../controllers/land-controller';
import { LandManager } from '../managers/land-manager';

export const GameClientModule = createClientSideModule({
	controllers: [PlayerController, PickDropController, InvetoryController, ActorController, LandController],
	managers: [BowManager, PlayerManager, PickDropManager, ShortcutManager, BackpackManager, ActorManager, LandManager],
	uiStates: [BowUsingState, PlayerState, BackpackContainerState, InventoryBlockState, ShortcutContainerState],
	providers: [{ key: ActorFactory, value: actorFactory }],
});
