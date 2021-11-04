import { createServerSideModule } from '../../../framework/module';
import { Brick } from './brick';
import { Land } from './land';
import { LandController } from './land-controller';
import { LandLoadManager } from './land-load-manager';
import { LandManager } from './land-manager';
import { LandMoveManager } from './land-move-manager';

export const LandModule = createServerSideModule({
	controllers: [LandController],
	managers: [LandLoadManager, LandManager, LandMoveManager],
	entities: [Land, Brick],
});
