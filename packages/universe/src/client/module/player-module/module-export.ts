import { createClientSideModule } from '@uni.js/client';
import { PlayerController } from './player-controller';
import { PlayerManager } from './player-manager';
import { PlayerState } from './ui-state';

export const PlayerModule = createClientSideModule({
	controllers: [PlayerController],
	managers: [PlayerManager],
	uiStates: [PlayerState],
});
