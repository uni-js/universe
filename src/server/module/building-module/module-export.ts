import { BuildingController } from './building-controller';
import { BuildingManager } from './building-manager';
import { createServerSideModule } from '../../../framework/module';

export const BuildingModule = createServerSideModule({
	controllers: [BuildingController],
	managers: [BuildingManager],
	entities: [],
});
