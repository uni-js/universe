import { doTickable } from '../../shared/update';
import { GetUniqueId, Vector2 } from './math';
import { EventEmitter } from './event';
import { Direction, WalkingState } from '../../shared/actor';
import { Entity } from '../../shared/database/memory';

export const MOVEMENT_TICK_MIN_DISTANCE = 0.0001;

export enum ActorType {
	NONE = 'none',
	HUMAN = 'human',
	PLAYER = 'player',
}

export class Actor extends Entity {
	posX: number = 0;
	posY: number = 0;

	atLandX: number = 0;
	atLandY: number = 0;

	motionX: number = 0;
	motionY: number = 0;
	type: ActorType;

	isMoveDirty = false;
	isBaseStateDirty = false;
	isLandMoveDirty = false;

	isActor: boolean = true;

	direction: Direction = Direction.FORWARD;
	walking: WalkingState = WalkingState.SILENT;
}
