import { createServerSideModule } from '@uni.js/server';
import { InventoryController } from '../controllers/inventory-controller';
import { InventoryMgr } from '../managers/inventory-manager';
import { InventoryEntities } from '../entity/inventory-entity';
import { Brick } from '../entity/brick-entity';
import { Land } from '../entity/land-entity';
import { LandController } from '../controllers/land-controller';
import { LandLoadMgr } from '../managers/land-load-manager';
import { LandMgr } from '../managers/land-manager';
import { LandMoveMgr } from '../managers/land-move-manager';
import { Item } from '../entity/item-entity';
import { DroppedItemActor } from '../entity/dropped-item-entity';
import { PickDropController } from '../controllers/pick-drop-controller';
import { Player } from '../entity/player-entity';
import { PlayerController } from '../controllers/player-controller';
import { PlayerMgr } from '../managers/player-manager';
import { Bow } from '../entity/bow-entity';
import { BowMgr } from '../managers/bow-manager';
import { ActorController } from '../controllers/actor-controller';
import { ActorMgr } from '../managers/actor-manager';
import { Actor } from '../entity/actor-entity';

export const GameModule = createServerSideModule({
	controllers: [InventoryController, LandController, PickDropController, PlayerController, ActorController],
	managers: [InventoryMgr, LandLoadMgr, LandMgr, LandMoveMgr, PlayerMgr, BowMgr, ActorMgr],
	entities: [...InventoryEntities, Item, Brick, Land, DroppedItemActor, Player, Bow, Actor],
});
