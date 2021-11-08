import { createServerSideModule } from '../../../framework/module';
import { Brick } from './brick-entity';
import { Land } from './land-entity';
import { LandController } from './land-controller';
import { LandLoadManager } from './land-load-manager';
import { LandManager } from './land-manager';
import { LandMoveManager } from './land-move-manager';

export const LandModule = createServerSideModule({
	controllers: [LandController],
	managers: [LandLoadManager, LandManager, LandMoveManager],
	entities: [Land, Brick],
});
