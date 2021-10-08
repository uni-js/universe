import { ActorType, AttachMapping, Actor } from '../actor/spec';
import { CtorOption } from '../shared/entity';
import { RecordSet } from '../utils';

export class Player extends Actor {
	type = ActorType.PLAYER;

	connId: string;

	@CtorOption()
	sizeX = 1;

	@CtorOption()
	sizeY = 1.5;

	@CtorOption()
	anchorX = 0.5;

	@CtorOption()
	anchorY = 1;

	@CtorOption()
	playerName = 'Player';

	@CtorOption()
	attachMapping: AttachMapping = {
		right_hand: {
			left: [-0.4, -0.5],
			right: [0.4, -0.5],
			back: [0, -0.5],
			forward: [0, -0.4],
		},
	};

	motionDecreaseRate = 0.75;

	canDamage = true;

	isPlayer = true;

	usedLands: RecordSet<string> = new RecordSet();
	spawnedActors: RecordSet<number> = new RecordSet();
}
