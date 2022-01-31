import { createServerSideModule } from '@uni.js/server';
import { DroppedItemActor } from './dropped-item-entity';
import { PickDropController } from './pick-drop-controller';

export const PickDropModule = createServerSideModule({
	controllers: [PickDropController],
	entities: [DroppedItemActor],
});
