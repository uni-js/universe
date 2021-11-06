import { createServerSideModule } from '../../../framework/module';
import { ActorController } from './actor-controller';
import { ActorManager } from './actor-manager';
import { Actor } from './spec';

export const ActorModule = createServerSideModule({
	controllers: [ActorController],
	managers: [ActorManager],
	entities: [Actor],
});
