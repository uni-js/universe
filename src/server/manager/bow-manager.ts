import { inject, injectable } from 'inversify';
import { ActorType, Direction, Actor } from '../actor/spec';
import { Arrow, Bow } from '../entity/bow';
import { GameEvent } from '../event';
import { ExtendedEntityManager } from '../shared/manager';
import { ActorManager } from './actor-manager';

export const ARROW_DROP_TICKS = 10;
export const ARROW_DEAD_TICKS = 30;

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
		arrow.shooter = attachingActor.$loki;

		const power = 2;

		if (attachingActor.direction == Direction.LEFT) {
			arrow.motionX = -power;
			arrow.shootingDirection = Math.PI;
		} else if (attachingActor.direction == Direction.RIGHT) {
			arrow.motionX = power;
			arrow.shootingDirection = 0;
		} else if (attachingActor.direction == Direction.FORWARD) {
			arrow.motionY = power;
			arrow.shootingDirection = Math.PI / 2;
		} else if (attachingActor.direction == Direction.BACK) {
			arrow.motionY = -power;
			arrow.shootingDirection = (3 * Math.PI) / 2;
		}

		this.addNewEntity(arrow);
	}

	private doAliveTick() {
		const arrows = this.findEntities({ type: ActorType.ARROW });
		for (const item of arrows) {
			const arrow = item as Arrow;
			arrow.aliveTick += 1;

			if (arrow.aliveTick >= ARROW_DROP_TICKS) {
				arrow.motionX = 0;
				arrow.motionY = 0;
			} else {
				arrow.motionX *= 0.8;
				arrow.motionY *= 0.8;
			}

			if (arrow.aliveTick >= ARROW_DEAD_TICKS) {
				this.removeEntity(arrow);
			} else {
				this.updateEntity(arrow);
			}
		}
	}

	private doCollisionTick() {
		const arrows = this.actorManager.findEntities({ type: ActorType.ARROW });
		for (const actor of arrows) {
			const arrow = actor as Arrow;
			const shooter = this.actorManager.getEntityById(arrow.shooter);

			const collisions = this.actorManager.getActorCollisionWith(arrow, [shooter]);
			collisions.forEach((collision) => {
				if (collision.actor.canDamage) {
					this.actorManager.damageActor(collision.actor, 10);
				}
			});
		}
	}
	doTick() {
		this.doAliveTick();
		this.doCollisionTick();
	}
}
