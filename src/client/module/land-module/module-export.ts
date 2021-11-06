import { createClientSideModule } from '../../../framework/module';
import { LandController } from './land-controller';
import { LandManager } from './land-manager';

export const LandModule = createClientSideModule({
	controllers: [LandController],
	managers: [LandManager],
});
