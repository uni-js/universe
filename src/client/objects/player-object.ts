import { BILLION_VALUE, Vector2 } from '../../server/utils/math';
import { TextureProvider } from '@uni.js/texture';
import { ActorConstructOption, ActorObject } from './actor-object';
import { AckData, EntityState, Input, PredictedInputManager } from '@uni.js/prediction';
import { ActorType, RunningState } from '../../server/types/actor';

export interface ControlMoved {
	moved: Vector2;
	startAt: Vector2;
}

export class Player extends ActorObject {
	public isTakeControl = false;

	/**
	 * @readonly
	 */
	public playerName: string;

	private isUsingDirty = false;
	private controlMoved: Vector2 | false = false;
	private predictedInputMgr: PredictedInputManager;

	constructor(serverId: number, option: ActorConstructOption, textureProvider: TextureProvider) {
		super(serverId, option, new Vector2(option.sizeX, option.sizeY), ActorType.PLAYER, textureProvider);

		this.canWalk = true;
		this.showHealth = true;
		this.hasShadow = true;

		this.playerName = option.playerName;

		this.tagname = this.playerName;
		this.anchor = new Vector2(0.5, 1);
		this.sprite.animationSpeed = 0.12;

		this.walkTextures = this.textureProvider.getGroup('actor.player');

		if (option.isUsing) {
			this.startUsing();
		} else if (this.isUsing) {
			this.endUsing();
		}

		this.controlRunning(RunningState.SILENT);
		this.predictedInputMgr = new PredictedInputManager({ ...this.vPos, motionX: option.motionX, motionY: option.motionY });
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

			this.controlRunning(RunningState.WALKING);
		}

		if (!this.controlMoved && this.isTakeControl) {
			this.controlRunning(RunningState.SILENT);
		}
	}

	setTakeControl() {
		this.isTakeControl = true;

		this.predictedInputMgr.on('applyState', (state: EntityState) => {
			this.vPos = new Vector2(state.x, state.y);
		});

		this.predictedInputMgr.on('applyInput', (input: Input) => {
			this.emit('ControlMovedEvent', { input: input, direction: this.direction, running: this.running });
		});
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

	doFixedUpdateTick(tick: number) {
		super.doFixedUpdateTick.call(this, tick);

		if (this.isTakeControl) {
			this.predictedInputMgr.doGameTick();
		}

		if (this.isUsingDirty) {
			this.emit('ToggleUsingEvent', { playerId: this.serverId, startOrEnd: this.isUsing ? true : false });
			this.isUsingDirty = false;
		}

		this.doControlMoveTick(tick);
		this.doOrderTick();
	}
}
