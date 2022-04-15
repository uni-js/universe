import { Building } from '../building/building';
import type { Server } from '../server';
import { Square2, Vector2 } from '../utils/vector2';
import { Actor } from './actor';
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

	canCheckOverlap(): boolean {
		return true;
	}

	protected onOverlapActors(actors: Actor[]): void {
		for(const actor of actors) {
			if (actor === this.shooter) {
				continue;
			}
			const powerVec = this.motion.normalize();
			actor.knockBack(powerVec);
			actor.damage(10);
			this.kill();
			break;
		}
	}

	protected onOverlapBuildings(buildings: Building[]): void {
		this.kill();
	}

	doCheckOverlapTick() {
		const square = this.lastTickPos ? new Square2(this.lastTickPos, this.pos) : undefined;
		const actors = this.getOverlapActors(square)
		if (actors.length > 0) {
			this.onOverlapActors(actors);
		}
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
