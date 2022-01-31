import { createServerSideModule } from '@uni.js/server';
import { ActorController } from './actor-controller';
import { ActorManager } from './actor-manager';
import { Actor } from './actor-entity';

export const ActorModule = createServerSideModule({
	controllers: [ActorController],
	managers: [ActorManager],
	entities: [Actor],
});
