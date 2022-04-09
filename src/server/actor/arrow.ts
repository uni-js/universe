import type { Server } from '../server';
import { Vector2 } from '../utils/vector2';
import { Actor } from './actor';
import { ActorType } from './actor-type';

export class Arrow extends Actor {
	private aliveTicks: number = 0;
	protected friction: number = 0.2;

	constructor(buildData: any, pos: Vector2, server: Server) {
		super(buildData, pos, server);
		this.anchor = new Vector2(0, 0.5);
	}

	setMotion(motion: Vector2): void {
		super.setMotion(motion);
		this.rotation = motion.getRad();
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
