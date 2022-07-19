import type { Server } from '../server';
import { Vector2 } from '../utils/vector2';
import { Actor, Collision } from './actor';
import { ActorType } from './actor-type';

export class Arrow extends Actor {	
	private aliveTicks: number = 0;
	private shooter: Actor;
	protected friction: number = 0.2;

	constructor(buildData: any, pos: Vector2, server: Server) {
		super(buildData, pos, server);
		this.shooter = this.world.getActor(buildData.shooter);
		this.anchor = new Vector2(0, 0.5);
	}

	canCheckCollusion(): boolean {
		return true;
	}

	protected onCollisions(collisions: Collision[]) {
		for(const collision of collisions) {
			if (collision.actor === this.shooter) {
				continue;
			}
			if (collision.isActor) {
				const powerVec = this.motion.normalize();
				const actor = collision.actor;
				actor.knockBack(powerVec);
				actor.damage(10);
				this.kill();
				break;	
			} else {
				this.setPosition(this.pos.add(collision.backwards));
				break;
			}
		}
	}

	isSlimActor(): boolean {
		return true;
	}

	setMotion(motion: Vector2): void {
		super.setMotion(motion);
		if (motion.length() > 0) {
			this.rotation = motion.getRad();
		}
	}

	getType(): number {
		return ActorType.ARROW;
	}

	getSize(): Vector2 {
		return new Vector2(2, 0.2);
	}

	doTick(): void {
		super.doTick();

		this.aliveTicks++;

		if (this.aliveTicks > 20) {
			this.kill();
		}
	}

}
