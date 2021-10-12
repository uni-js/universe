import { BILLION_VALUE, Vector2 } from '../../server/shared/math';
import { TextureProvider } from '../texture';
import { ActorType, Direction, RunningState } from '../../server/actor/spec';
import { ActorCtorOption, ActorObject } from '../shared/actor';
import * as Events from '../event/internal';

export interface ControlMoved {
	moved: Vector2;
	startAt: Vector2;
}

export class Player extends ActorObject {
	private controlMoved: Vector2 | false;
	private takeControl = false;
	private playerName: string;

	constructor(serverId: number, option: ActorCtorOption, texture: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.PLAYER, texture, true, 12, true, 0);

		this.playerName = option.playerName;

		this.setTagName(this.playerName);
		this.setAnchor(0.5, 1);
		this.setAnimateSpeed(0.12);
		this.setRunning(RunningState.SILENT);
	}
	addMovePoint(point: Vector2) {
		if (this.takeControl) this.setPosition(point);
		else super.addMovePoint(point);
	}
	setTakeControl() {
		this.takeControl = true;
	}
	setDirection(direction: Direction, dirty = true) {
		if (this.direction == direction) return;

		const textures = this.getDirectionTextures(direction);
		textures.push(textures.shift());

		this.setTextures(textures);
		this.direction = direction;

		if (dirty) this.isStatesDirty = true;
	}
	controlMove(delta: Vector2 | false) {
		if (delta === false) {
			this.controlMoved = false;
			return;
		}

		this.controlMoved = delta;

		if (delta) {
			if (delta.y > 0) {
				this.setDirection(Direction.FORWARD);
			} else if (delta.y < 0) {
				this.setDirection(Direction.BACK);
			} else if (delta.x > 0) {
				this.setDirection(Direction.RIGHT);
			} else if (delta.x < 0) {
				this.setDirection(Direction.LEFT);
			}
		}
	}
	private doControlMoveTick(tick: number) {
		if (this.controlMoved) {
			const target = this.getPosition().add(this.controlMoved);
			this.setPosition(target);
			this.setRunning(RunningState.WALKING);

			this.emitEvent(Events.ControlMovedEvent, { posX: target.x, posY: target.y, direction: this.direction, running: this.running });
		}
		if (!this.controlMoved) {
			if (this.takeControl) {
				this.setRunning(RunningState.SILENT);
			}
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
