import { createClientSideModule } from '../../../framework/module';
import { PlayerController } from './player-controller';
import { PlayerManager } from './player-manager';
import { PlayerState } from './ui-state';

export const PlayerModule = createClientSideModule({
	controllers: [PlayerController],
	managers: [PlayerManager],
	uiStates: [PlayerState],
});
