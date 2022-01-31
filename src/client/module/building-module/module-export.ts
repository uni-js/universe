import { BuildingController } from './building-controller';
import { BuildingManager } from './building-manager';
import { createClientSideModule } from '@uni.js/client';

export const BuildingModule = createClientSideModule({
	controllers: [BuildingController],
	managers: [BuildingManager],
});
