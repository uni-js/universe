import { createServerSideModule } from '@uni.js/server';
import { Player } from './player-entity';
import { PlayerController } from './player-controller';
import { PlayerManager } from './player-manager';

export const PlayerModule = createServerSideModule({
	controllers: [PlayerController],
	managers: [PlayerManager],
	entities: [Player],
});
