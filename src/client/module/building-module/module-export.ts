import { BuildingController } from './building-controller';
import { BuildingManager } from './building-manager';
import { createClientSideModule } from '../../../framework/module';

export const BuildingModule = createClientSideModule({
	controllers: [BuildingController],
	managers: [BuildingManager],
});
