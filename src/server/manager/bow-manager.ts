import { inject, injectable } from 'inversify';
import { ActorType, Direction, Actor } from '../actor/spec';
import { Arrow, Bow } from '../entity/bow';
import { GameEvent } from '../event';
import { ExtendedEntityManager } from '../shared/manager';
import { ActorManager } from './actor-manager';

export const ARROW_DEAD_TICKS = 10;

@injectable()
export class BowManager extends ExtendedEntityManager<Actor, Bow> {
	constructor(@inject(ActorManager) private actorManager: ActorManager) {
		super(actorManager, Bow);

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

		this.addNewEntity(arrow);
	}

	private doAliveTick() {
		const arrows = this.findEntities({ type: ActorType.ARROW });
		for (const item of arrows) {
			const arrow = item as Arrow;
			arrow.aliveTick += 1;

			this.updateEntity(arrow);
			if (arrow.aliveTick >= ARROW_DEAD_TICKS) this.removeEntity(arrow);
		}
	}
	doTick() {
		this.doAliveTick();
	}
}
