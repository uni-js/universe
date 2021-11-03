import { createServerSideModule } from '../../../framework/module';
import { Bow } from './bow';
import { BowManager } from './bow-manager';

export const BowModule = createServerSideModule([], [], [BowManager], [Bow]);
