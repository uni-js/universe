import { Entity } from '@uni.js/server';
import { Attachment, ConstructOption } from '../../shared/entity';
import { RecordMap } from '../../utils';
import { ActorType, AttachMapping, AttachType, Direction, RunningState } from './spec';
import { injectable } from 'inversify';
import { Factory } from '../../../shared/factory';

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

	@ConstructOption()
	boundings = [0, 0, this.sizeX, this.sizeY];

	@ConstructOption()
	obstacle = false;

	@ConstructOption()
	obstacleHinder = true;

	@ConstructOption()
	rotation = 0;

	@ConstructOption()
	posX = 0;

	@ConstructOption()
	posY = 0;

	lastPosX = 0;

	lastPosY = 0;

	@ConstructOption()
	aimTarget = 0;

	@ConstructOption()
	motionX = 0;

	@ConstructOption()
	motionY = 0;

	motionDecreaseRate = 0.9;

	@ConstructOption()
	isUsing = false;

	isPlayer = false;

	@ConstructOption()
	useTick = 0;

	@ConstructOption()
	attachments: RecordMap<Attachment, AttachType> = new RecordMap();

	@ConstructOption()
	attaching: Attachment;

	type: ActorType;

	@ConstructOption()
	attachMapping: AttachMapping;

	lastInputSeqId = -1;

	canDamage = false;

	isMoveDirty = false;
	isWalkDirty = false;

	isActor = true;

	direction: Direction = Direction.FORWARD;
	running: RunningState = RunningState.SILENT;
}


@injectable()
export class ActorFactory extends Factory<ActorType, Actor, any[]> {}
