import { Actor, CtorOption } from '../shared/entity';
import { RecordSet } from '../utils';

export class Player extends Actor {
	connId: string;

	@CtorOption()
	playerName = 'Player';

	isPlayer = true;

	usedLands: RecordSet<string> = new RecordSet();
	spawnedActors: RecordSet<number> = new RecordSet();
}
