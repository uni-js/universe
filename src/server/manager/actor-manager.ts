import SAT from 'sat';

import { Attachment } from '../shared/entity';
import { EntityManager, UpdateOnlyCollection } from '../shared/manager';
import { injectable } from 'inversify';
import { injectCollection } from '../../shared/database/memory';
import { GameEvent } from '../event';
import { Vector2 } from '../shared/math';
import { PosToLandPos } from '../land/helper';
import { Direction, RunningState, Actor } from '../actor/spec';

export interface CollisionResult {
	actor: Actor;
	response: SAT.Response;
}

@injectable()
export class ActorManager extends EntityManager<Actor> {
	constructor(@injectCollection(Actor) private actorList: UpdateOnlyCollection<Actor>) {
		super(actorList);
	}

	damageActor(actor: Actor, costHealth: number) {
		if (actor.health - costHealth < 0) {
			actor.health = 0;
			//TODO: death
		} else {
			actor.health -= costHealth;
		}

		this.actorList.update(actor);

		this.emit(GameEvent.ActorDamagedEvent, actor.$loki, actor.health);
	}

	getActorBoundingBox(actor: Actor): [number, number, number, number] {
		const x = actor.posX - actor.sizeX * actor.anchorX;
		const y = actor.posY - actor.sizeY * actor.anchorY;
		const w = actor.sizeX;
		const h = actor.sizeY;
		return [x, y, w, h];
	}

	getActorCollisionWith(targetActor: Actor, excepts: Actor[] = []): CollisionResult[] {
		const [targetX, targetY, targetW, targetH] = this.getActorBoundingBox(targetActor);

		const vecA = new SAT.Vector(targetX, targetY);
		const boxA = new SAT.Box(vecA, targetW, targetH).toPolygon();
		const nearActors = this.getNearActors(new Vector2(targetX, targetY));
		const results: CollisionResult[] = [];
		for (const actor of nearActors) {
			if (actor === targetActor) continue;
			if (excepts.includes(actor)) continue;

			const [x, y, w, h] = this.getActorBoundingBox(actor);

			const vecB = new SAT.Vector(x, y);
			const boxB = new SAT.Box(vecB, w, h).toPolygon();
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

	setAttachment(targetActorId: number, key: string, actorId: number) {
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
		this.emit(GameEvent.ActorSetAttachment, targetActor.$loki, key, actorId);
	}

	getAttachment(targetActorId: number, key: string) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		return actor.attachments.get(key);
	}

	getAttachments(targetActorId: number) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		return actor.attachments.getAll();
	}

	removeAttachment(targetActorId: number, key: string) {
		const actor = this.actorList.findOne({ $loki: targetActorId });
		this.removeAtRecord(actor, 'attachments', key);

		this.emit(GameEvent.ActorRemoveAttachment, actor.$loki, key);
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
		actor.running = running;
		actor.direction = direction;
		actor.isWalkDirty = true;

		this.actorList.update(actor);
	}

	startUsing(actorId: number) {
		const actor = this.actorList.findOne({ $loki: actorId });

		actor.isUsing = true;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emit(GameEvent.ActorToggleUsingEvent, actorId, true, 0, actor);
	}

	endUsing(actorId: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		const useTick = actor.useTick;

		actor.isUsing = false;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emit(GameEvent.ActorToggleUsingEvent, actorId, false, useTick, actor);
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
		actor.isMoveDirty = true;

		const landPos = PosToLandPos(new Vector2(actor.posX, actor.posY));
		const lastLandPos = PosToLandPos(new Vector2(originPosX, originPosY));
		const landDelta = landPos.sub(lastLandPos);

		if (landDelta.getSqrt() > 0) {
			this.emit(GameEvent.LandMoveEvent, actor.$loki, landPos, lastLandPos);
		}
		this.actorList.update(actor);
	}

	private updateMoveDirty() {
		const dirtyActors = this.actorList.find({ isMoveDirty: true });
		for (const actor of dirtyActors) {
			this.updateAttachment(actor.$loki);

			actor.isMoveDirty = false;
			this.actorList.update(actor);
			this.emit(GameEvent.NewPosEvent, actor.$loki);
		}
	}

	private updateWalkDirty() {
		const dirtyActors = this.actorList.find({ isWalkDirty: true });
		for (const actor of dirtyActors) {
			actor.isWalkDirty = false;
			this.actorList.update(actor);
			this.emit(GameEvent.NewWalkStateEvent, actor.$loki);
		}
	}

	private getAttachPosition(actor: Actor, key: string): [number, number] {
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
			this.moveToPosition(actor, new Vector2(actor.posX + actor.motionX, actor.posY + actor.motionY));
		}
	}

	doTick(tick: number) {
		this.updateMoveDirty();
		this.updateWalkDirty();
		this.updateUsing();
		this.updateMotion();
	}
}
