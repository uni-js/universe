import { ActorType, AttachMapping, Actor } from '../actor-module/spec';
import { ConstructOption } from '../../shared/entity';
import { RecordSet } from '../../utils';

export class Player extends Actor {
	type = ActorType.PLAYER;

	connId: string;

	@ConstructOption()
	sizeX = 1;

	@ConstructOption()
	sizeY = 1.5;

	bounding = [-0.5, -1.5, 0.5, 0];

	@ConstructOption()
	anchorX = 0.5;

	@ConstructOption()
	anchorY = 1;

	@ConstructOption()
	playerName = 'Player';

	@ConstructOption()
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
