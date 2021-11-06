import { createServerSideModule } from '../../../framework/module';
import { DroppedItemActor } from './dropped-item';
import { PickDropController } from './pick-drop-controller';

export const PickDropModule = createServerSideModule({
	controllers: [PickDropController],
	entities: [DroppedItemActor],
});
