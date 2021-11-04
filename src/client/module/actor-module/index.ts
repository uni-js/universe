import { createClientSideModule } from '../../../framework/module';
import { ActorFactory } from './actor';
import { ActorController } from './actor-controller';
import { ActorManager } from './actor-manager';
import { ActorMapper } from './spec';

export const ActorModule = createClientSideModule({
	controllers: [ActorController],
	managers: [ActorManager],
	providers: [{ key: ActorFactory, value: new ActorFactory().addImpls(ActorMapper) }],
});
