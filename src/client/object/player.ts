import { BILLION_VALUE, Vector2 } from '../../server/shared/math';
import { TextureProvider } from '../texture';
import { ActorType, Direction, RunningState } from '../../server/actor/spec';
import { ActorCtorOption, ActorObject } from './actor';
import * as Events from '../event/internal';

export interface ControlMoved {
	moved: Vector2;
	startAt: Vector2;
}

export class Player extends ActorObject {
	public takeControl = false;

	/**
	 * @readonly
	 */
	public playerName: string;

	private controlMoved: Vector2 | false;

	constructor(serverId: number, option: ActorCtorOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.PLAYER, texture);

		this.canWalk = true;
		this.showHealth = true;

		this.playerName = option.playerName;

		this.tagname = this.playerName;
		this.anchor = new Vector2(0.5, 1);
		this.sprite.animationSpeed = 0.12;

		this.walkTextures = this.texture.get('actor.player');

		this.controlRunning(RunningState.SILENT);
	}

	addMovePoint(point: Vector2) {
		if (this.takeControl) this.vPos = point;
		else super.addMovePoint(point);
	}

	controlMove(delta: Vector2 | false) {
		if (delta === false) {
			this.controlMoved = false;
			return;
		}

		this.controlMoved = delta;

		if (delta) {
			if (delta.y > 0) {
				this.controlDirection(Direction.FORWARD);
			} else if (delta.y < 0) {
				this.controlDirection(Direction.BACK);
			} else if (delta.x > 0) {
				this.controlDirection(Direction.RIGHT);
			} else if (delta.x < 0) {
				this.controlDirection(Direction.LEFT);
			}
		}
	}

	private doControlMoveTick(tick: number) {
		if (this.controlMoved) {
			const target = this.vPos.add(this.controlMoved);
			this.vPos = target;
			this.controlRunning(RunningState.WALKING);

			this.emitEvent(Events.ControlMovedEvent, { posX: target.x, posY: target.y, direction: this.direction, running: this.running });
		}

		if (!this.controlMoved && this.takeControl) {
			this.controlRunning(RunningState.SILENT);
		}
	}

	private doOrderTick() {
		this.zIndex = 2 + (this.y / BILLION_VALUE + 1) / 2;
	}

	async doTick(tick: number) {
		super.doTick.call(this, tick);

		this.doControlMoveTick(tick);
		this.doOrderTick();
	}
}
