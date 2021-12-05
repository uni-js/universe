import SAT from 'sat';

import { Attachment } from '../../shared/entity';
import { EntityManager, UpdateOnlyCollection } from '../../../framework/server-side/server-manager';
import { injectable } from 'inversify';
import { injectCollection } from '../../../framework/server-side/memory-database';
import { Vector2 } from '../../shared/math';
import { PosToLandPos } from '../land-module/helper';
import { Direction, RunningState, Actor, AttachType, isAngleMatchDirection, getDirectionAngle, calcBoundingBox } from './spec';
import { Input } from '../../../framework/client-side/prediction';

import * as Events from '../../event/internal';

export interface CollisionResult {
	actor: Actor;
	response: SAT.Response;
}

@injectable()
export class ActorManager extends EntityManager<Actor> {
	constructor(@injectCollection(Actor) private actorList: UpdateOnlyCollection<Actor>) {
		super(actorList);
	}

	/**
	 * damage an actor
	 *
	 * @param fromRad rad the damage cames from, [0, 2*PI]
	 */
	damageActor(actor: Actor, costHealth: number, fromRad: number, power = 1) {
		if (actor.health - costHealth < 0) {
			actor.health = 0;
			//TODO: death
		} else {
			actor.health -= costHealth;
		}

		const knockBackMotion = Vector2.getVector2ByDistance(power, fromRad);
		this.setMotion(actor.$loki, knockBackMotion);

		this.actorList.update(actor);

		this.emitEvent(Events.ActorDamagedEvent, { actorId: actor.$loki, finalHealth: actor.health });
	}

	getActorBoundingBox(actor: Actor) {
		if (!actor.boundings) return;

		return calcBoundingBox(new Vector2(actor.posX, actor.posY), actor.boundings);
	}

	/**
	 * @param {Actor} targetActor the actor being checked
	 * @param {boolean} lastMovement
	 * consider last movement into checking
	 * @param {Actor[]} excepts excepts entities will not be checked
	 * @returns {CollisionResult[]} check results
	 */
	getActorCollisionWith(targetActor: Actor, lastMovement = false, excepts: Actor[] = []): CollisionResult[] {
		const bBox = this.getActorBoundingBox(targetActor);
		if (!bBox) return [];
		const [fX, fY, tX, tY] = bBox;
		const { lastPosX, lastPosY } = targetActor;

		const vecA = lastMovement ? new SAT.Vector(lastPosX, lastPosY) : new SAT.Vector(fX, fY);
		const width = lastMovement ? tX - lastPosX : tX - fX;
		const height = lastMovement ? tY - lastPosY : tY - fY;

		const boxA = new SAT.Box(vecA, width, height).toPolygon();
		const nearActors = this.getNearActors(new Vector2(fX, fY));
		const results: CollisionResult[] = [];
		for (const actor of nearActors) {
			if (actor === targetActor) continue;
			if (excepts.includes(actor)) continue;
			const actorBBox = this.getActorBoundingBox(actor);
			if (!actorBBox) continue;

			const [fromX, fromY, toX, toY] = actorBBox;

			const vecB = new SAT.Vector(fromX, fromY);
			const boxB = new SAT.Box(vecB, toX - fromX, toY - fromY).toPolygon();
			const response = new SAT.Response();
			const collided = SAT.testPolygonPolygon(boxB, boxA, response);
			if (!collided) continue;
			results.push({
				actor,
				response,
			});
		}
		return results;
	}

	getNearActors(pos: Vector2): Actor[] {
		const distance = 10;

		return this.actorList.find({
			posX: { $between: [pos.x - distance, pos.x + distance] },
			posY: { $between: [pos.y - distance, pos.y + distance] },
		});
	}

	setAttachment(targetActorId: number, key: AttachType, actorId: number) {
		const targetActor = this.actorList.findOne({ $loki: targetActorId });
		const actor = this.actorList.findOne({ $loki: actorId });

		this.addAtRecord<Attachment>(
			targetActor,
			'attachments',
			{
				key,
				actorId,
			},
			key,
		);

		actor.attaching = { key, actorId: targetActorId };

		this.updateAttachment(targetActorId);

		this.emitEvent(Events.ActorSetAttachmentEvent, {
			targetActorId: targetActor.$loki,
			key,
			actorId,
		});
	}

	getAttachment(targetActorId: number, key: AttachType) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		return actor.attachments.get(key);
	}

	getAttachments(targetActorId: number) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		return actor.attachments.getAll();
	}

	removeAttachment(targetActorId: number, key: AttachType) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		this.removeAtRecord(actor, 'attachments', key);

		this.emitEvent(Events.ActorRemoveAttachmentEvent, { targetActorId: actor.$loki, key });
	}

	clearAttachments(targetActorId: number, removeActors = false) {
		const attachments = this.getAttachments(targetActorId);
		for (const attachment of attachments) {
			this.removeAttachment(targetActorId, attachment.key);
			if (removeActors) {
				const actor = this.getEntityById(attachment.actorId);
				this.removeEntity(actor);
			}
		}
	}

	setWalkState(actorId: number, running: RunningState, direction: Direction) {
		const actor = this.actorList.findOne({ $loki: actorId });
		const isRunningChanged = actor.running !== running;
		const isDirectionChanged = actor.direction !== direction;
		if (!isRunningChanged && !isDirectionChanged) return;

		actor.running = running;
		actor.direction = direction;
		actor.isWalkDirty = true;

		this.actorList.update(actor);

		if (isDirectionChanged) {
			const attachment = this.getAttachment(actor.$loki, AttachType.RIGHT_HAND);
			attachment && this.setRotation(attachment.actorId, getDirectionAngle(actor.direction));
		}
	}

	startUsing(actorId: number) {
		const actor = this.actorList.findOne({ $loki: actorId });

		actor.isUsing = true;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emitEvent(Events.ActorToggleUsingEvent, { actorId, startOrEnd: true, useTick: 0 });
	}

	endUsing(actorId: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		const useTick = actor.useTick;

		actor.isUsing = false;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emitEvent(Events.ActorToggleUsingEvent, { actorId, startOrEnd: false, useTick });
	}

	setAimTarget(actorId: number, aimTarget: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		const validDirection = isAngleMatchDirection(actor.direction, aimTarget);
		actor.aimTarget = validDirection ? aimTarget : undefined;
		this.actorList.update(actor);
	}

	processInput(actorId: number, input: Input) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.lastInputSeqId = input.seqId;
		this.moveToPosition(actor, new Vector2(actor.posX + input.moveX, actor.posY + input.moveY));
	}

	setRotation(actorId: number, rotation: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.rotation = rotation;
		this.actorList.update(actor);

		this.emitEvent(Events.ActorSetRotationEvent, { actorId, rotation });
	}

	removeEntity<T extends Actor>(actor: T): void {
		super.removeEntity.call(this, actor);

		for (const attachment of actor.attachments.getAll()) {
			this.removeEntity(this.getEntityById(attachment.actorId));
		}
	}

	moveToPosition(actor: Actor, position: Vector2) {
		const originPosX = actor.posX;
		const originPosY = actor.posY;

		const delta = position.sub(new Vector2(originPosX, originPosY));

		actor.posX += delta.x;
		actor.posY += delta.y;

		actor.lastPosX = originPosX;
		actor.lastPosY = originPosY;

		actor.isMoveDirty = true;

		const landPos = PosToLandPos(new Vector2(actor.posX, actor.posY));
		const lastLandPos = PosToLandPos(new Vector2(originPosX, originPosY));
		const landDelta = landPos.sub(lastLandPos);

		if (landDelta.getSqrt() > 0) {
			this.emitEvent(Events.LandMoveEvent, {
				actorId: actor.$loki,
				targetLandPosX: landPos.x,
				targetLandPosY: landPos.y,
				sourceLandPosX: lastLandPos.x,
				sourceLandPosY: lastLandPos.y,
			});
		}
		this.actorList.update(actor);
	}

	private updateMoveDirty() {
		const dirtyActors = this.actorList.find({ isMoveDirty: true });
		for (const actor of dirtyActors) {
			this.updateAttachment(actor.$loki);

			if (actor.isMoveDirty) {
				actor.isMoveDirty = false;
				this.actorList.update(actor);

				this.emitEvent(Events.NewPosEvent, {
					actorId: actor.$loki,
					posX: actor.posX,
					posY: actor.posY,
					motionX: actor.motionX,
					motionY: actor.motionY,
					processedInputSeq: actor.lastInputSeqId,
				});
			}
		}
	}

	private updateWalkDirty() {
		const dirtyActors = this.actorList.find({ isWalkDirty: true });
		for (const actor of dirtyActors) {
			actor.isWalkDirty = false;
			this.actorList.update(actor);
			this.emitEvent(Events.NewWalkStateEvent, {
				actorId: actor.$loki,
				direction: actor.direction,
				running: actor.running,
			});
		}
	}

	private getAttachPosition(actor: Actor, key: AttachType): [number, number] {
		if (actor.attachMapping && actor.attachMapping[key]) {
			return actor.attachMapping[key][actor.direction];
		} else {
			return [0, 0];
		}
	}

	private updateAttachment(targetActorId: number) {
		const targetActor = this.getEntityById(targetActorId);
		this.getAttachments(targetActorId).forEach((attachment) => {
			const actor = this.getEntityById(attachment.actorId);

			const relPos = this.getAttachPosition(targetActor, attachment.key);

			const posX = targetActor.posX + relPos[0];
			const posY = targetActor.posY + relPos[1];

			this.moveToPosition(actor, new Vector2(posX, posY));
		});
	}

	private updateUsing() {
		const actorsIsUsing = this.actorList.find({ isUsing: true });
		for (const actor of actorsIsUsing) {
			actor.useTick++;
			this.actorList.update(actor);
		}
	}

	private updateMotion() {
		const motionActors = this.actorList.find({
			$or: [
				{
					motionX: {
						$ne: 0,
					},
				},
				{
					motionY: {
						$ne: 0,
					},
				},
			],
		});

		for (const actor of motionActors) {
			const newMotion = new Vector2(actor.motionX, actor.motionY).mul(actor.motionDecreaseRate);
			this.setMotion(actor.$loki, newMotion.getSqrt() > 0.1 ? newMotion : new Vector2(0, 0));
			this.moveToPosition(actor, new Vector2(actor.posX + actor.motionX, actor.posY + actor.motionY));
		}
	}

	setMotion(actorId: number, motion: Vector2, motionRate?: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.motionX = motion.x;
		actor.motionY = motion.y;
		actor.isMoveDirty = true;
		if (motionRate !== undefined) {
			actor.motionDecreaseRate = motionRate;
		}
		this.actorList.update(actor);
	}

	doTick(tick: number) {
		this.updateMoveDirty();
		this.updateWalkDirty();
		this.updateUsing();
		this.updateMotion();
	}
}
