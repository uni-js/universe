import { createServerSideModule } from '../../../framework/module';
import { ActorController } from './actor-controller';
import { ActorManager } from './actor-manager';
import { Actor } from './spec';

export const ActorModule = createServerSideModule([], [ActorController], [ActorManager], [Actor]);
