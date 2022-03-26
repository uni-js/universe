import { createServerSideModule } from '@uni.js/server';
import { InventoryController } from '../controllers/inventory-controller';
import { InventoryManager } from '../managers/inventory-manager';
import { InventoryEntities } from '../entity/inventory-entity';
import { Brick } from '../entity/brick-entity';
import { Land } from '../entity/land-entity';
import { LandController } from '../controllers/land-controller';
import { LandLoadManager } from '../managers/land-load-manager';
import { LandManager } from '../managers/land-manager';
import { LandMoveManager } from '../managers/land-move-manager';
import { Item } from '../entity/item-entity';
import { DroppedItemActor } from '../entity/dropped-item-entity';
import { PickDropController } from '../controllers/pick-drop-controller';
import { Player } from '../entity/player-entity';
import { PlayerController } from '../controllers/player-controller';
import { PlayerManager } from '../managers/player-manager';
import { Bow } from '../entity/bow-entity';
import { BowManager } from '../managers/bow-manager';
import { ActorController } from '../controllers/actor-controller';
import { ActorManager } from '../managers/actor-manager';
import { Actor } from '../entity/actor-entity';

export const GameModule = createServerSideModule({
	controllers: [InventoryController, LandController, PickDropController, PlayerController, ActorController],
	managers: [InventoryManager, LandLoadManager, LandManager, LandMoveManager, PlayerManager, BowManager, ActorManager],
	entities: [...InventoryEntities, Item, Brick, Land, DroppedItemActor, Player, Bow, Actor],
});
