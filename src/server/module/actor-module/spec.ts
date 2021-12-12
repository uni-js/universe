import { injectable } from 'inversify';
import { Entity } from '../../../framework/server-side/memory-database';
import { Factory } from '../../../shared/factory';
import { Attachment, ConstructOption } from '../../shared/entity';
import { Vector2 } from '../../shared/math';
import { RecordMap } from '../../utils';

import SAT from 'sat';

export enum ActorType {
	PLAYER,
	BOW,
	ARROW,
	DROPPED_ITEM,
}

export enum ActorTypeName {
	'player',
	'bow',
	'arrow',
	'dropitem',
}

export enum Direction {
	LEFT,
	RIGHT,
	FORWARD,
	BACK,
}

export enum RunningState {
	SILENT,
	WALKING,
	RUNNING,
}

export enum AttachType {
	RIGHT_HAND,
}

export interface AttachMappingUnit {
	[Direction.BACK]: [number, number];
	[Direction.FORWARD]: [number, number];
	[Direction.LEFT]: [number, number];
	[Direction.RIGHT]: [number, number];
	[key: number]: [number, number];
}

export interface AttachMapping {
	[AttachType.RIGHT_HAND]: AttachMappingUnit;
	[key: number]: AttachMappingUnit;
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

export function getDirectionAngle(direction: Direction) {
	if (direction === Direction.RIGHT) return 0;
	if (direction === Direction.BACK) return (3 * Math.PI) / 2;
	if (direction === Direction.LEFT) return Math.PI;
	if (direction === Direction.FORWARD) return Math.PI / 2;
}

/**
 * determinate if the angle match the direction
 * @param angle rad unit
 */
export function isAngleMatchDirection(direction: Direction, angle: number) {
	if (direction === Direction.RIGHT && (angle > (3 * Math.PI) / 2 || angle <= Math.PI / 2)) {
		return true;
	} else if (direction === Direction.BACK && (angle > Math.PI || angle <= 2 * Math.PI)) {
		return true;
	} else if (direction === Direction.LEFT && angle > Math.PI / 2 && angle <= (3 * Math.PI) / 2) {
		return true;
	} else if (direction === Direction.FORWARD && angle > 0 && angle <= Math.PI) {
		return true;
	}

	return false;
}

export function calcBoundingBox(pos: Vector2, boundings: number[]): [number, number, number, number] {
	const fromX = pos.x + boundings[0];
	const fromY = pos.y + boundings[1];
	const toX = pos.x + boundings[2];
	const toY = pos.y + boundings[3];

	return [fromX, fromY, toX, toY];
}

export function calcBoundingSATBox(pos: Vector2, boundings: number[]) {
	const [fromX, fromY, toX, toY] = calcBoundingBox(pos, boundings);
	return new SAT.Box(new SAT.Vector(fromX, fromY), toX - fromX, toY - fromY);
}
