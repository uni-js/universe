import { Actor, Attachment } from '../shared/entity';
import { EntityManager } from '../shared/manager';
import { injectable } from 'inversify';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { GameEvent } from '../event';
import { Vector2 } from '../shared/math';
import { PosToLandPos } from '../land/helper';
import { Direction, RunningState } from '../../shared/actor';

@injectable()
export class ActorManager extends EntityManager<Actor> {
	constructor(@injectCollection(Actor) private actorList: ICollection<Actor>) {
		super(actorList);
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

		this.emit(GameEvent.ActorToggleUsingEvent, actorId, true);
	}

	endUsing(actorId: number) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.isUsing = false;
		actor.useTick = 0;

		this.actorList.update(actor);

		this.emit(GameEvent.ActorToggleUsingEvent, actorId, false);
	}

	addNewEntity<T extends Actor>(actor: T): T {
		const inserted = super.addNewEntity.call(this, actor);
		this.emit(GameEvent.LandMoveEvent, actor.$loki, new Vector2(actor.posX, actor.posY));
		return inserted as T;
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

		const isOriginEmpty = originPosX == undefined || originPosY == undefined;

		const delta = position.sub(new Vector2(originPosX, originPosY));

		actor.posX += delta.x;
		actor.posY += delta.y;
		actor.isMoveDirty = true;

		const landPos = PosToLandPos(new Vector2(actor.posX, actor.posY));
		const landDelta = landPos.sub(new Vector2(actor.atLandX, actor.atLandY));

		if (isOriginEmpty || landDelta.getSqrt() > 0) {
			actor.isLandMoveDirty = true;
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

	private updateLandMoveDirty() {
		const dirtyActors = this.actorList.find({ isLandMoveDirty: true });
		for (const actor of dirtyActors) {
			actor.isLandMoveDirty = false;

			const landPos = PosToLandPos(new Vector2(actor.posX, actor.posY));
			const lastLandPos = new Vector2(actor.atLandX, actor.atLandY);

			actor.atLandX = landPos.x;
			actor.atLandY = landPos.y;
			this.actorList.update(actor);

			this.emit(GameEvent.LandMoveEvent, actor.$loki, landPos, lastLandPos);
		}
	}

	private getAttachPosition(actor: Actor, key: string) {
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

			const relPos = this.getAttachPosition(actor, attachment.key);

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

	doTick(tick: number) {
		this.updateMoveDirty();
		this.updateWalkDirty();
		this.updateLandMoveDirty();
		this.updateUsing();
	}
}
