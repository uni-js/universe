import { createClientSideModule } from '@uni.js/client';
import { LandController } from './land-controller';
import { LandManager } from './land-manager';

export const LandModule = createClientSideModule({
	controllers: [LandController],
	managers: [LandManager],
});
