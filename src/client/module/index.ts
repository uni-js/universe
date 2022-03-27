import { createClientSideModule } from '@uni.js/client';
import { BowMgr } from '../managers/bow-mgr';
import { BowUsingState } from '../ui-states/bow';
import { PlayerController } from '../controllers/player-controller';
import { PlayerMgr } from '../managers/player-mgr';
import { PlayerState } from '../ui-states/player';
import { PickDropController } from '../controllers/pick-drop-controller';
import { PickDropMgr } from '../managers/pick-drop-mgr';
import { InvetoryController } from '../controllers/inventory-controller';
import { ShortcutMgr, BackpackMgr } from '../managers/inventory-mgr';
import { BackpackContainerState, InventoryBlockState, ShortcutContainerState } from '../ui-states/inventory';
import { ActorController } from '../controllers/actor-controller';
import { ActorMgr } from '../managers/actor-mgr';
import { ActorFactory, actorFactory } from '../factory/actor';
import { LandController } from '../controllers/land-controller';
import { LandMgr } from '../managers/land-mgr';

export const GameClientModule = createClientSideModule({
	controllers: [PlayerController, PickDropController, InvetoryController, ActorController, LandController],
	managers: [BowMgr, PlayerMgr, PickDropMgr, ShortcutMgr, BackpackMgr, ActorMgr, LandMgr],
	uiStates: [BowUsingState, PlayerState, BackpackContainerState, InventoryBlockState, ShortcutContainerState],
	providers: [{ key: ActorFactory, value: actorFactory }],
});
