import { Actor } from '../shared/entity';
import { Manager } from '../shared/manager';
import { inject, injectable } from 'inversify';
import { ICollection, injectCollection } from '../database/memory';
import { GameEvent } from '../event';
import { Vector2 } from '../shared/math';
import { PosToLandPos } from '../land/helper';
import { Direction, WalkingState } from '../../shared/actor';

@injectable()
export class ActorManager extends Manager {
	constructor(@injectCollection(Actor) private actorList: ICollection<Actor>) {
		super();
	}
	setBaseState(actorId: number, walking: WalkingState, direction: Direction) {
		const actor = this.actorList.findOne({ $loki: actorId });
		actor.walking = walking;
		actor.direction = direction;
		actor.isBaseStateDirty = true;

		this.actorList.update(actor);
	}
	getAllActors() {
		return this.actorList.find();
	}
	getActorById(actorId: number) {
		return this.actorList.findOne({
			$loki: actorId,
		});
	}
	addNewActor<T extends Actor>(actor: T) {
		this.actorList.insertOne(actor);

		this.emit(GameEvent.AddActorEvent, actor.$loki);
		this.emit(GameEvent.LandMoveEvent, actor.$loki, new Vector2(actor.posX, actor.posY));
	}
	removeActor<T extends Actor>(actor: T) {
		const actorId = actor.$loki;
		this.actorList.remove(actor);
		this.emit(GameEvent.RemoveActorEvent, actorId, actor);
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
		const dirtyActors = this.actorList.find({ isBaseStateDirty: true });
		for (const actor of dirtyActors) {
			actor.isBaseStateDirty = false;
			this.actorList.update(actor);
			this.emit(GameEvent.NewBaseStateEvent, actor.$loki);
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
