import { BuildingController } from './building-controller';
import { BuildingManager } from './building-manager';
import { createServerSideModule } from '@uni.js/server';

export const BuildingModule = createServerSideModule({
	controllers: [BuildingController],
	managers: [BuildingManager],
	entities: [],
});
