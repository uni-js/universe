import { createClientSideModule } from '../../../framework/module';
import { ActorController } from './actor-controller';
import { ActorManager } from './actor-manager';
import { ActorFactory } from './actor-object';
import { actorFactory } from './spec';

export const ActorModule = createClientSideModule({
	controllers: [ActorController],
	managers: [ActorManager],
	providers: [{ key: ActorFactory, value: actorFactory }],
});
