import { Direction, RunningState } from '../../shared/actor';
import { Entity } from '../../shared/database/memory';

export const MOVEMENT_TICK_MIN_DISTANCE = 0.0001;

export enum ActorType {
	NONE = 'none',
	HUMAN = 'human',
	PLAYER = 'player',
}

export class Actor extends Entity {
	posX = 0;
	posY = 0;

	atLandX = 0;
	atLandY = 0;

	motionX = 0;
	motionY = 0;
	type: ActorType;

	isMoveDirty = false;
	isWalkDirty = false;
	isLandMoveDirty = false;

	isActor = true;

	direction: Direction = Direction.FORWARD;
	running: RunningState = RunningState.SILENT;
}
