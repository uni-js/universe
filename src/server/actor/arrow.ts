import type { Server } from '../server';
import { Vector2 } from '../utils/vector2';
import { Actor } from './actor';
import { ActorType } from './actor-type';

export class Arrow extends Actor {
	private aliveTicks: number = 0;

	constructor(buildData: any, pos: Vector2, server: Server) {
		super(buildData, pos, server);
		this.anchor = new Vector2(0, 0.5);
	}

	getType(): number {
		return ActorType.ARROW;
	}

	getSize(): Vector2 {
		return new Vector2(2, 0.2);
	}

	update() {
		super.update();
		this.aliveTicks++;

		if (this.aliveTicks > 200) {
			this.kill();
		}
	}
}
