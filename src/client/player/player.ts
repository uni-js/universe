import { ActorObject, JumpState } from '../actor/actor';
import { AckData, EntityState, Input, PredictedInputManager } from '@uni.js/prediction';
import { Vector2 } from '../../server/utils/vector2';
import { ActorType } from '../../server/actor/actor-type';
import { ControlMoveEvent, ControlWalkEvent, PlayerJumpEvent, PlayerStartUsing, PlayerStopUsing } from '../../server/event/client';
import type { GameClientApp } from '../client-app';
import { DirectionType, RunningType } from '../../server/actor/actor';
import { Texture, Resource, Sprite } from 'pixi.js';
import { ItemType } from '../../server/item/item-type';


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

	private controlMoved: Vector2 | false = false;
	private predictedInputMgr: PredictedInputManager;
	private isWalkDirty = false;
	private isUsingItem = false;
	private handHolding: Sprite;

	constructor(serverId: number, pos: Vector2, attrs: any, app: GameClientApp) {
		super(serverId, pos, attrs, app);


		this.handHolding = new Sprite();
		this.handHolding.width = 0.5;
		this.handHolding.height = 0.5;
		this.handHolding.anchor.set(0.5, 0.5);
		
		this.addChild(this.handHolding);

		this.setShowHealth(true);
		this.setHasShadow(true);

		this.sprite.animationSpeed = 0.12;

		if (this.running === undefined) {
			this.controlRunning(RunningType.SILENT);
		}

		if (this.direction === undefined) {
			this.controlDirection(DirectionType.FORWARD);
		}


		this.predictedInputMgr = new PredictedInputManager({ ...this.getPos(), motionX: attrs.motionX, motionY: attrs.motionY });
	}

	private playWalkingAnim() {
		let textures = [];
		if (this.direction === DirectionType.FORWARD) {
			textures = this.texturesPool.slice(0, 3);
		} else if (this.direction === DirectionType.BACK) {
			textures = this.texturesPool.slice(9, 12);
		} else if (this.direction === DirectionType.LEFT) {
			textures = this.texturesPool.slice(3, 6);
		} else {
			textures = this.texturesPool.slice(6, 9);
		}
		this.playAnimate(textures);
	}

	protected getDefaultTexture(): Texture<Resource> {
		if (this.direction === DirectionType.FORWARD) {
			return this.texturesPool[1];
		} else if (this.direction === DirectionType.BACK) {
			return this.texturesPool[10];
		} else if (this.direction === DirectionType.LEFT) {
			return this.texturesPool[4];
		} else {
			return this.texturesPool[7];
		}
	}

	setDirection(direction: DirectionType): boolean {
		const hasChanged = super.setDirection(direction);

		if (hasChanged) {
			this.setTextures(this.getDefaultTexture())
			this.stopAnimate();
			if (this.running === RunningType.WALKING){
				this.playWalkingAnim();
			}

			this.updateHandHoldingDirection();
		}

		return hasChanged;
	}

	private updateHandHoldingDirection() {
		if (this.direction !== DirectionType.BACK) {
			this.handHolding.visible = true;

			this.handHolding.y = -0.35;
			this.handHolding.rotation = 0;
			this.handHolding.scale.x = 1;

			if (this.direction === DirectionType.FORWARD) {
				this.handHolding.x = 0;
				this.handHolding.rotation = Math.PI / 2;
			} else if (this.direction === DirectionType.LEFT) {
				this.handHolding.x = -0.4
				this.handHolding.scale.x = -1;
			} else {
				this.handHolding.x = 0.4
			}
			this.handHolding.width = 0.5;
		} else {
			this.handHolding.visible = false;
		}
	}

	setRunning(running: RunningType): boolean {
		const hasChanged = super.setRunning(running);
		if (hasChanged) {
			if (running === RunningType.WALKING) {
				this.stopAnimate();
				this.playWalkingAnim();	
			} else if (running === RunningType.SILENT) {
				this.stopAnimate();
			}
		}
		return hasChanged;
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

	controlUsing(startOrStop: boolean) {
		if(startOrStop) {
			if (this.isUsingItem) {
				return;
			}
			this.isUsingItem = true;
			const event = new PlayerStartUsing();
			event.actorId = this.getServerId();
			this.emitEvent(event);
		} else {
			if (!this.isUsingItem) {
				return;
			}
			this.isUsingItem = false;
			const event = new PlayerStopUsing();
			event.actorId = this.getServerId();
			this.emitEvent(event);
		}
	}

	controlJump(direction: DirectionType, jumpUp: boolean) {
		if (this.jumpState !== JumpState.SILENT) {
			return;
		}
		const event = new PlayerJumpEvent();
		event.jumpUp = jumpUp;
		event.actorId = this.getServerId();
		event.direction = direction;
		this.emitEvent(event);
	}

	ackInput(ackData: AckData) {
		this.predictedInputMgr.ackInput(ackData);
	}

	private doControlMoveTick(tick: number) {
		if (this.controlMoved) {
			const moved = this.controlMoved;
			const curPos = this.getPos();
			const nextPos = curPos.add(moved);

			const curBrick = this.world.getBrickXY(curPos.x, curPos.y);
			const nextBrick = this.world.getBrickXY(nextPos.x, nextPos.y);
			if (curBrick && nextBrick && nextBrick.layers.length !== curBrick.layers.length) {
				this.controlJump(this.direction, nextBrick.layers.length > curBrick.layers.length);
			} else {
				this.predictedInputMgr.pendInput({
					moveX: moved.x,
					moveY: moved.y,
				});	
			}

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
			this.setPos(new Vector2(state.x, state.y));
		});

		this.predictedInputMgr.on('applyInput', (input: Input) => {
			const event = new ControlMoveEvent();
			event.actorId = this.getServerId();
			event.input = input;
			this.emitEvent(event);
		});
	}

	setHandholdItem(holdItem: ItemType) {
		const texture = this.textureProvider.get(`handhold.${holdItem}`) || this.textureProvider.get(`item.${holdItem}`);
		this.handHolding.texture = texture;
	}

	emitEvent(event: any) {
		this.eventBus.emitBusEvent(event);
	}

	controlRunning(running: RunningType) {
		if(this.setRunning(running)) {
			this.isWalkDirty = true;
		}			
	}

	controlDirection(direction: DirectionType) {
		if(this.setDirection(direction)) {
			this.isWalkDirty = true;
		}
	}

	doTick(tick: number) {
		super.doTick(tick);

		if (this.isMaster()) {
			this.predictedInputMgr.doGameTick();
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
	}
}
