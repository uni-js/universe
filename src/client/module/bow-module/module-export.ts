import { createClientSideModule } from '../../../framework/module';
import { BowManager } from './bow-manager';
import { BowUsingState } from './ui-state';

export const BowModule = createClientSideModule({
	managers: [BowManager],
	uiStates: [BowUsingState],
});
