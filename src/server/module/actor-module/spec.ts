import { injectable } from 'inversify';
import { Entity } from '../../../framework/memory-database';
import { Factory } from '../../../shared/factory';
import { Attachment, ConstructOption } from '../../shared/entity';
import { RecordMap } from '../../utils';

export enum ActorType {
	PLAYER = 'player',
	BOW = 'bow',
	ARROW = 'arrow',
	DROPPED_ITEM = 'dropped_item',
}

export enum Direction {
	LEFT = 'left',
	RIGHT = 'right',
	FORWARD = 'forward',
	BACK = 'back',
}

export enum RunningState {
	SILENT = 'silent',
	WALKING = 'walking',
	RUNNING = 'running',
}

export enum AttachType {
	RIGHT_HAND = 'right_hand',
}

export interface AttachMappingUnit {
	[Direction.BACK]: [number, number];
	[Direction.FORWARD]: [number, number];
	[Direction.LEFT]: [number, number];
	[Direction.RIGHT]: [number, number];
	[key: string]: [number, number];
}

export interface AttachMapping {
	[AttachType.RIGHT_HAND]: AttachMappingUnit;
	[key: string]: AttachMappingUnit;
}

export class Actor extends Entity {
	@ConstructOption()
	health = 100;

	@ConstructOption()
	sizeX = 1;

	@ConstructOption()
	sizeY = 1;

	@ConstructOption()
	anchorX = 0;

	@ConstructOption()
	anchorY = 0;

	bounding = [0, 0, this.sizeX, this.sizeY];

	@ConstructOption()
	rotation = 0;

	@ConstructOption()
	posX = 0;

	@ConstructOption()
	posY = 0;

	lastPosX = 0;

	lastPosY = 0;

	@ConstructOption()
	motionX = 0;

	@ConstructOption()
	motionY = 0;

	motionDecreaseRate = 0.9;

	@ConstructOption()
	isUsing = false;

	@ConstructOption()
	useTick = 0;

	@ConstructOption()
	attachments: RecordMap<Attachment> = new RecordMap();

	@ConstructOption()
	attaching: Attachment;

	type: ActorType;

	@ConstructOption()
	attachMapping: AttachMapping;

	canDamage = false;

	isMoveDirty = false;
	isControlMoveDirty = false;
	isWalkDirty = false;

	isActor = true;

	direction: Direction = Direction.FORWARD;
	running: RunningState = RunningState.SILENT;
}

@injectable()
export class ActorFactory extends Factory<string, Actor, any[]> {}
