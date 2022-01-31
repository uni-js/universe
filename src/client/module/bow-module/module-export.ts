import { createClientSideModule } from '@uni.js/client';
import { BowManager } from './bow-manager';
import { BowUsingState } from './ui-state';

export const BowModule = createClientSideModule({
	managers: [BowManager],
	uiStates: [BowUsingState],
});
