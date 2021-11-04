import { createServerSideModule } from '../../../framework/module';
import { Player } from './player';
import { PlayerController } from './player-controller';
import { PlayerManager } from './player-manager';

export const PlayerModule = createServerSideModule({
	controllers: [PlayerController],
	managers: [PlayerManager],
	entities: [Player],
});
