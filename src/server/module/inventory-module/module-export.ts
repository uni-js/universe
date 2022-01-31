import { createServerSideModule } from '@uni.js/server';
import { InventoryEntities } from './inventory-entity';
import { InventoryController } from './inventory-controller';
import { InventoryManager } from './inventory-manager';
import { ItemDef } from './item-entity';

export const InventoryModule = createServerSideModule({
	controllers: [InventoryController],
	managers: [InventoryManager],
	entities: [...InventoryEntities, ItemDef],
});
