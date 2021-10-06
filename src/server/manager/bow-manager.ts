import { inject, injectable } from 'inversify';
import { ActorType, Direction, Actor } from '../actor/spec';
import { Arrow } from '../entity/bow';
import { GameEvent } from '../event';
import { Manager } from '../shared/manager';
import { ActorManager } from './actor-manager';

@injectable()
export class BowManager extends Manager {
	constructor(@inject(ActorManager) private actorManager: ActorManager) {
		super();
		this.actorManager.on(GameEvent.ActorToggleUsingEvent, this.onActorToggleUsing);
	}
	private onActorToggleUsing = (actorId: number, startOrEnd: boolean, useTick: number, actor: Actor) => {
		if (actor.type != ActorType.BOW) return;
		if (startOrEnd) {
			this.startDragging(actor);
		} else {
			this.endDragging(actor, useTick);
		}
	};
	private startDragging(actor: Actor) {}

	private endDragging(actor: Actor, useTick: number) {
		if (useTick <= 10) return;

		const attachingActor = this.actorManager.getEntityById(actor.attaching.actorId);

		const arrow = new Arrow();
		arrow.posX = actor.posX;
		arrow.posY = actor.posY;

		if (attachingActor.direction == Direction.LEFT) {
			arrow.motionX = -1;
			arrow.shootingDirection = Math.PI;
		} else if (attachingActor.direction == Direction.RIGHT) {
			arrow.motionX = 1;
			arrow.shootingDirection = 0;
		} else if (attachingActor.direction == Direction.FORWARD) {
			arrow.motionY = 1;
			arrow.shootingDirection = Math.PI / 2;
		} else if (attachingActor.direction == Direction.BACK) {
			arrow.motionY = -1;
			arrow.shootingDirection = (3 * Math.PI) / 2;
		}

		this.actorManager.addNewEntity(arrow);
	}
}
