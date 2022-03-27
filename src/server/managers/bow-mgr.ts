import { inject, injectable } from 'inversify';
import { Actor } from '../entity/actor-entity';
import { Arrow, Bow } from '../entity/bow-entity';
import { ActorMgr, ActorMgrEvents } from './actor-mgr';
import { ExtendedEntityManager } from '@uni.js/database';

import { HandleEvent } from '@uni.js/event';
import { Vector2 } from '../utils/math';

import SAT from 'sat';
import { PlayerMgr, PlayerMgrEvents } from './player-mgr';
import { InventoryMgr } from './inventory-mgr';
import { ActorType } from '../types/actor';
import { ARROW_DEAD_TICKS, ARROW_DROP_TICKS, BOW_DRAGGING_MAX_TICKS, BOW_RELEASING_MIN_TICKS } from '../types/tools';

@injectable()
export class BowMgr extends ExtendedEntityManager<Actor, Bow> {
	constructor(
		@inject(ActorMgr) private actorMgr: ActorMgr,
		@inject(PlayerMgr) private playerMgr: PlayerMgr,
		@inject(InventoryMgr) private inventoryMgr: InventoryMgr,
	) {
		super(actorMgr, Bow);
	}

	@HandleEvent('playerMgr', 'ToggleUsingEvent')
	private onToggleUsing(event: PlayerMgrEvents['ToggleUsingEvent']) {
		const actorId = this.playerMgr.getRightHand(event.playerId);
		const actor = this.actorMgr.getEntityById(actorId);

		if (actor.type != ActorType.BOW) return;

		if (event.startOrEnd) {
			this.startDragging(actor);
		} else {
			this.endDragging(actor, event.useTick);
		}
	}

	private doCollisionTick() {
		const arrows = this.actorMgr.findEntities({ type: ActorType.ARROW });
		for (const actor of arrows) {
			const arrow = actor as Arrow;
			const shooter = this.actorMgr.getEntityById(arrow.shooter);
			const pos = new Vector2(arrow.posX, arrow.posY);
			const lastPos = new Vector2(arrow.lastPosX, arrow.lastPosY);

			const polygon = new SAT.Polygon(new SAT.Vector(), [pos.toSATVector(), lastPos.toSATVector()]);
			const collisions = this.actorMgr.getCollisionWith(polygon, pos, [shooter], true);

			const damageTarget = collisions.find((collision) => collision.actor.canDamage);
			if (damageTarget) {
				this.arrowDamageActor(arrow, damageTarget.actor);
				break;
			}
		}
	}

	private startDragging(actor: Actor) {}

	private endDragging(actor: Actor, useTick: number) {
		if (useTick <= BOW_RELEASING_MIN_TICKS) return;

		const attachingActor = this.actorMgr.getEntityById(actor.attaching);
		const aimTarget = attachingActor.aimTarget;

		if (aimTarget === undefined) return;

		const arrow = new Arrow();
		arrow.posX = actor.posX;
		arrow.posY = actor.posY;
		arrow.shooter = attachingActor.id;

		arrow.power = Math.min(useTick, BOW_DRAGGING_MAX_TICKS) / 20;

		const motion = arrow.power * 2;

		arrow.rotation = aimTarget;
		this.addNewEntity(arrow);

		this.actorMgr.setMotion(arrow.id, new Vector2(motion * Math.cos(aimTarget), motion * Math.sin(aimTarget)));
	}

	private doAliveTick() {
		const arrows = this.findEntities({ type: ActorType.ARROW });
		for (const item of arrows) {
			const arrow = item as Arrow;
			arrow.aliveTick += 1;

			if (arrow.aliveTick >= ARROW_DROP_TICKS) {
				arrow.motionX = 0;
				arrow.motionY = 0;
			}

			if (arrow.aliveTick >= ARROW_DEAD_TICKS) {
				this.removeEntity(arrow);
			} else {
				this.updateEntity(arrow);
			}
		}
	}

	private arrowDamageActor(arrow: Arrow, actor: Actor) {
		this.actorMgr.damageActor(actor, 10, arrow.rotation, arrow.power);

		arrow.aliveTick = ARROW_DEAD_TICKS;
		this.updateEntity(arrow);
	}

	doTick() {
		this.doCollisionTick();
		this.doAliveTick();
	}
}
