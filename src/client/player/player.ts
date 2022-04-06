import { ActorObject } from '../actor/actor';
import { AckData, EntityState, Input, PredictedInputManager } from '@uni.js/prediction';
import { Vector2 } from '../../server/utils/vector2';
import { ActorType } from '../../server/actor/actor-type';
import { ControlMoveEvent, ControlWalkEvent } from '../../server/event/client';
import type { GameClientApp } from '../client-app';
import { DirectionType, RunningType } from '../../server/actor/actor';

const BILLION_VALUE = 10000000;

export interface ControlMoved {
	moved: Vector2;
	startAt: Vector2;
}

export class Player extends ActorObject {
	private _isMaster = false;

	/**
	 * @readonly
	 */
	public playerName: string;

	private isUsingDirty = false;
	private controlMoved: Vector2 | false = false;
	private predictedInputMgr: PredictedInputManager;
	private isWalkDirty = false;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);

		this.canWalk = true;
		this.showHealth = true;
		this.hasShadow = true;

		this.playerName = attrs.playerName;

		this.tagname = this.playerName;
		this.anchor = new Vector2(0.5, 1);
		this.sprite.animationSpeed = 0.12;

		this.walkTextures = this.getDefaultTextureGroup();

		if (attrs.isUsing) {
			this.startUsing();
		} else if (this.isUsing) {
			this.endUsing();
		}

		if (this.running === undefined) {
			this.controlRunning(RunningType.SILENT);
		}

		if (this.direction === undefined) {
			this.controlDirection(DirectionType.FORWARD);
		}

		this.predictedInputMgr = new PredictedInputManager({ ...this.vPos, motionX: attrs.motionX, motionY: attrs.motionY });
	}

	getType(): ActorType {
		return ActorType.PLAYER;
	}

	controlMove(delta: Vector2 | false) {
		if (delta === false) {
			this.controlMoved = false;
			return;
		}

		this.controlMoved = delta;
	}

	ackInput(ackData: AckData) {
		this.predictedInputMgr.ackInput(ackData);
	}

	private doControlMoveTick(tick: number) {
		if (this.controlMoved) {
			const moved = this.controlMoved;

			this.predictedInputMgr.pendInput({
				moveX: moved.x,
				moveY: moved.y,
			});

			this.controlRunning(RunningType.WALKING);
		}

		if (!this.controlMoved && this.isMaster()) {
			this.controlRunning(RunningType.SILENT);
		}
	}

	isMaster() {
		return this._isMaster;
	}

	setIsMaster() {
		if (this._isMaster) {
			return;
		}

		this._isMaster = true;

		this.predictedInputMgr.on('applyState', (state: EntityState) => {
			this.vPos = new Vector2(state.x, state.y);
		});

		this.predictedInputMgr.on('applyInput', (input: Input) => {
			const event = new ControlMoveEvent();
			event.actorId = this.getServerId();
			event.input = input;
			this.emitEvent(event);
		});
	}

	emitEvent(event: any) {
		this.eventBus.emitBusEvent(event);
	}

	startUsing(dirty = true) {
		if (this.isUsing == true) return;

		this.isUsing = true;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	endUsing(dirty = true) {
		if (this.isUsing == false) return;

		this.isUsing = false;
		if (dirty) {
			this.isUsingDirty = true;
		}
	}

	private doOrderTick() {
		this.zIndex = 2 + (this.y / BILLION_VALUE + 1) / 2;
	}

	controlRunning(running: RunningType) {
		if (this.running === running) return;

		this.running = running;
		this.isWalkDirty = true;
	}

	controlDirection(direction: DirectionType) {
		if (this.direction == direction) return;

		this.direction = direction;
		this.isWalkDirty = true;
	}

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick(tick);

		if (this.isMaster()) {
			this.predictedInputMgr.doGameTick();
		}

		if (this.isUsingDirty) {
			this.emit('ToggleUsingEvent', { playerId: this.serverId, startOrEnd: this.isUsing ? true : false });
			this.isUsingDirty = false;
		}

		if (this.isWalkDirty && this.isMaster()) {
			const event = new ControlWalkEvent();
			event.actorId = this.getServerId();
			event.direction = this.direction;
			event.running = this.running;

			this.eventBus.emitBusEvent(event);
			this.isWalkDirty = false;
		}

		this.doControlMoveTick(tick);
		this.doOrderTick();
	}
}
