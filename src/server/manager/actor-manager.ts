import { Actor } from '../shared/entity';
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

	setWalkState(actorId: number, running: RunningState, direction: Direction) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.running = running;
		actor.direction = direction;
		actor.isWalkDirty = true;

		this.actorList.update(actor);
	}

	addNewEntity<T extends Actor>(actor: T): T {
		const inserted = super.addNewEntity.call(this, actor);
		this.emit(GameEvent.LandMoveEvent, actor.$loki, new Vector2(actor.posX, actor.posY));
		return inserted as T;
	}

	moveToPosition(actor: Actor, position: Vector2) {
		const delta = position.sub(new Vector2(actor.posX, actor.posY));
		if (delta.getSqrt() <= 0) return;

		actor.posX += delta.x;
		actor.posY += delta.y;
		actor.isMoveDirty = true;

		const landPos = PosToLandPos(new Vector2(actor.posX, actor.posY));
		const landDelta = landPos.sub(new Vector2(actor.atLandX, actor.atLandY));

		if (landDelta.getSqrt() > 0) {
			actor.isLandMoveDirty = true;
		}
		this.actorList.update(actor);
	}

	private updateMoveDirty() {
		const dirtyActors = this.actorList.find({ isMoveDirty: true });
		for (const actor of dirtyActors) {
			actor.isMoveDirty = false;
			this.actorList.update(actor);
			this.emit(GameEvent.NewPosEvent, actor.$loki);
		}
	}

	private updateBaseStateDirty() {
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

	doTick(tick: number) {
		this.updateMoveDirty();
		this.updateBaseStateDirty();
		this.updateLandMoveDirty();
	}
}
