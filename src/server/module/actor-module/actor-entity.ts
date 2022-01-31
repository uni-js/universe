import { Entity, Private, Property, Index } from '@uni.js/database';
import { Attachment } from '../../shared/entity';
import { RecordMap } from '../../utils';
import { ActorType, AttachMapping, AttachType, Direction, RunningState } from './spec';
import { injectable } from 'inversify';
import { Factory } from '../../../shared/factory';

@Index(['posX', 'posY'])
@Entity()
export class Actor {
	id: number = undefined;

	@Property()
	health = 100;

	@Property()
	sizeX = 1;

	@Property()
	sizeY = 1;

	@Property()
	anchorX = 0;

	@Property()
	anchorY = 0;

	@Property()
	boundings = [0, 0, this.sizeX, this.sizeY];

	@Property()
	obstacle = false;

	@Property()
	obstacleHinder = true;

	@Property()
	rotation = 0;

	@Property()
	posX = 0;

	@Property()
	posY = 0;

	@Private()
	@Property()
	lastPosX = 0;

	@Private()
	@Property()
	lastPosY = 0;

	@Property()
	aimTarget = 0;

	@Property()
	motionX = 0;

	@Property()
	motionY = 0;

	@Private()
	@Property()
	motionDecreaseRate = 0.9;

	@Index()
	@Property()
	isUsing = false;

	@Private()
	@Index()
	@Property()
	isPlayer = false;

	@Property()
	useTick = 0;

	@Property()
	attachments: RecordMap<Attachment, AttachType> = new RecordMap();

	@Property()
	attaching: Attachment;

	@Private()
	@Property()
	@Index()
	type: ActorType;

	@Private()
	@Property()
	attachMapping: AttachMapping;

	@Private()
	@Property()
	lastInputSeqId = -1;

	@Private()
	@Property()
	canDamage = false;

	@Private()
	@Index()
	@Property()
	isMoveDirty = false;

	@Private()
	@Index()
	@Property()
	isWalkDirty = false;

	@Index()
	@Property()
	isActor = true;

	@Property()
	direction: Direction = Direction.FORWARD;

	@Property()
	running: RunningState = RunningState.SILENT;
}

@injectable()
export class ActorFactory extends Factory<ActorType, Actor, any[]> {}
