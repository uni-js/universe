import SAT from 'sat';

import { EntityManager, UpdateOnlyCollection } from '@uni.js/database';
import { injectable } from 'inversify';
import { injectCollection } from '@uni.js/database';
import { Vector2 } from '../../shared/math';
import { PosToLandPos } from '../land-module/helper';
import { Direction, RunningState, AttachType, isAngleMatchDirection, getDirectionAngle, calcBoundingBox, ActorType } from './spec';
import { Input } from '@uni.js/prediction';
import { Actor } from './actor-entity';

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
		this.setMotion(actor.id, knockBackMotion);

		this.actorList.update(actor);

		this.emitEvent(Events.ActorDamagedEvent, { actorId: actor.id, finalHealth: actor.health });
	}

	getActorBoundingBox(actor: Actor) {
		if (!actor.boundings) return;

		return calcBoundingBox(new Vector2(actor.posX, actor.posY), actor.boundings);
	}

	getCollisionWith(polygon: SAT.Polygon, pos: Vector2, excepts: Actor[] = [], checkObstacle = true) {
		const nearActors = this.getNearActors(pos);
		const results: CollisionResult[] = [];

		// check collusion
		for (const actor of nearActors) {
			if (excepts.includes(actor)) continue;
			if (checkObstacle && !actor.obstacle) continue;

			const actorBBox = this.getActorBoundingBox(actor);
			if (!actorBBox) continue;

			const [fromX, fromY, toX, toY] = actorBBox;

			const vecB = new SAT.Vector(fromX, fromY);
			const boxB = new SAT.Box(vecB, toX - fromX, toY - fromY).toPolygon();
			const response = new SAT.Response();
			const collided = SAT.testPolygonPolygon(polygon, boxB, response);
			if (!collided) continue;
			if (response.overlapV.len() <= 0) continue;
			results.push({
				actor,
				response,
			});
		}
		return results;
	}

	getBoundingsCollisionWith(boundings: number[], pos: Vector2, checkObstacle = true, excepts: Actor[] = []): CollisionResult[] {
		const boundingBox = calcBoundingBox(pos, boundings);
		const bBox = boundingBox;
		if (!bBox) return [];
		const [fX, fY, tX, tY] = bBox;

		const vecA = new SAT.Vector(fX, fY);
		const width = tX - fX;
		const height = tY - fY;

		const polygon = new SAT.Box(vecA, width, height).toPolygon();
		return this.getCollisionWith(polygon, pos, excepts, checkObstacle);
	}

	getNearActors(pos: Vector2): Actor[] {
		return this.actorList.find({ isActor: true });
	}

	setAttachment(targetActorId: number, key: AttachType, actorId: number) {
		const targetActor = this.actorList.findOne({ id: targetActorId });
		const actor = this.actorList.findOne({ id: actorId });

		targetActor.attachments.add(key, {
			key,
			actorId,
		});

		actor.attaching = { key, actorId: targetActorId };

		this.updateAttachment(targetActorId);

		this.emitEvent(Events.ActorSetAttachmentEvent, {
			targetActorId: targetActor.id,
			key,
			actorId,
		});
	}

	getAttachment(targetActorId: number, key: AttachType) {
		const actor = this.actorList.findOne({ id: targetActorId });
		return actor.attachments.get(key);
	}

	getAttachments(targetActorId: number) {
		const actor = this.actorList.findOne({ id: targetActorId });
		return actor.attachments.getAll();
	}

	removeAttachment(targetActorId: number, key: AttachType) {
		const actor = this.actorList.findOne({ id: targetActorId });
		actor.attachments.remove(key);

		this.emitEvent(Events.ActorRemoveAttachmentEvent, { targetActorId: actor.id, key });
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
		const actor = this.actorList.findOne({ id: actorId });
		const isRunningChanged = actor.running !== running;
		const isDirectionChanged = actor.direction !== direction;
		if (!isRunningChanged && !isDirectionChanged) return;

		actor.running = running;
		actor.direction = direction;
		actor.isWalkDirty = true;

		this.actorList.update(actor);

		if (isDirectionChanged) {
			const attachment = this.getAttachment(actor.id, AttachType.RIGHT_HAND);
			attachment && this.setRotation(attachment.actorId, getDirectionAngle(actor.direction));
		}
	}

	startUsing(actorId: number) {
		const actor = this.actorList.findOne({ id: actorId });

		actor.isUsing = true;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emitEvent(Events.ActorToggleUsingEvent, { actorId, startOrEnd: true, useTick: 0 });
	}

	endUsing(actorId: number) {
		const actor = this.actorList.findOne({ id: actorId });
		const useTick = actor.useTick;

		actor.isUsing = false;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emitEvent(Events.ActorToggleUsingEvent, { actorId, startOrEnd: false, useTick });
	}

	setAimTarget(actorId: number, aimTarget: number) {
		const actor = this.actorList.findOne({ id: actorId });
		const validDirection = isAngleMatchDirection(actor.direction, aimTarget);
		actor.aimTarget = validDirection ? aimTarget : undefined;
		this.actorList.update(actor);
	}

	processInput(actorId: number, input: Input) {
		const actor = this.actorList.findOne({ id: actorId });
		actor.lastInputSeqId = input.seqId;
		this.moveToPosition(actor, new Vector2(actor.posX + input.moveX, actor.posY + input.moveY));
	}

	setRotation(actorId: number, rotation: number) {
		const actor = this.actorList.findOne({ id: actorId });
		actor.rotation = rotation;
		this.actorList.update(actor);

		this.emitEvent(Events.ActorSetRotationEvent, { actorId, rotation });
	}

	removeEntity<T extends Actor>(actor: T): void {
		super.removeEntity.call(this, actor as any);

		for (const attachment of actor.attachments.getAll()) {
			this.removeEntity(this.getEntityById(attachment.actorId));
		}
	}

	moveToPosition(actor: Actor, position: Vector2) {
		const originPos = new Vector2(actor.posX, actor.posY);
		let delta = position.sub(originPos);

		if (actor.boundings) {
			const checkResults = this.getBoundingsCollisionWith(actor.boundings, position, true, [actor]);
			for (const result of checkResults) {
				delta = delta.sub(Vector2.fromSATVector(result.response.overlapV));
			}
			if (checkResults.length > 0) {
				this.emitEvent(Events.ActorCollusionEvent, {
					actorId: actor.id,
					actorType: actor.type,
					checkResults: checkResults.map((r) => ({ actorId: r.actor.id, actorType: r.actor.type, checkResponse: r.response })),
				});
			}
		}

		if (delta.getSqrt() < 0.001) return;

		const targetPos = originPos.add(delta);
		actor.posX = targetPos.x;
		actor.posY = targetPos.y;

		actor.lastPosX = originPos.x;
		actor.lastPosY = originPos.y;

		actor.isMoveDirty = true;

		const landPos = PosToLandPos(targetPos);
		const lastLandPos = PosToLandPos(originPos);
		const landDelta = landPos.sub(lastLandPos);

		if (landDelta.getSqrt() > 0) {
			this.emitEvent(Events.LandMoveEvent, {
				actorId: actor.id,
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
			this.updateAttachment(actor.id);

			if (actor.isMoveDirty) {
				actor.isMoveDirty = false;
				this.actorList.update(actor);

				this.emitEvent(Events.NewPosEvent, {
					actorId: actor.id,
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
				actorId: actor.id,
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
		const motionActors = this.actorList.find({ isActor: true });

		for (const actor of motionActors) {
			if(actor.motionX === 0 && actor.motionY === 0) continue;
			const newMotion = new Vector2(actor.motionX, actor.motionY).mul(actor.motionDecreaseRate);
			this.setMotion(actor.id, newMotion.getSqrt() > 0.1 ? newMotion : new Vector2(0, 0));
			this.moveToPosition(actor, new Vector2(actor.posX + actor.motionX, actor.posY + actor.motionY));
		}
	}

	setMotion(actorId: number, motion: Vector2, motionRate?: number) {
		const actor = this.actorList.findOne({ id: actorId });
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
