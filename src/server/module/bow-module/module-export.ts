import { createServerSideModule } from '../../../framework/module';
import { Bow } from './bow-entity';
import { BowManager } from './bow-manager';

export const BowModule = createServerSideModule({
	managers: [BowManager],
	entities: [Bow],
});
