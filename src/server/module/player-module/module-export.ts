import { createServerSideModule } from '../../../framework/module';
import { Player } from './player-entity';
import { PlayerController } from './player-controller';
import { PlayerManager } from './player-manager';

export const PlayerModule = createServerSideModule({
	controllers: [PlayerController],
	managers: [PlayerManager],
	entities: [Player],
});
