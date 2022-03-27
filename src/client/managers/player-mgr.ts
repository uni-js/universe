import { Vector2 } from '../../server/utils/math';
import { HTMLInputProvider, InputKey } from '@uni.js/html-input';
import { ClientSideManager } from '@uni.js/client';
import { Viewport } from '@uni.js/viewport';
import { inject, injectable } from 'inversify';
import { Player } from '../objects/player-object';
import { ActorMgr } from './actor-mgr';
import { UIEventBus } from '@uni.js/ui';
import { PlayerState } from '../ui-states/player';

import SAT from 'sat';
import { Input } from '@uni.js/prediction';
import { Direction, RunningState } from '../../server/types/actor';
import { calcBoundingSATBox } from '../../server/utils/actor';

export interface PlayerMgrEvents {
	ControlMovedEvent: {
		input: Input;
		direction: Direction;
		running: RunningState;
	};
	SetAimTargetEvent: {
		rotation: number;
	};
	ToggleUsingEvent: {
		playerId: number;
		startOrEnd: boolean;
		actorType: number;
	};
}

@injectable()
export class PlayerMgr extends ClientSideManager<PlayerMgrEvents> {
	public settingAimTarget = false;

	/**
	 * @readonly
	 */
	public currPlayer: Player;
	private lastAimTarget: number;

	constructor(
		@inject(PlayerState) private playerState: PlayerState,
		@inject(HTMLInputProvider) private inputProvider: HTMLInputProvider,
		@inject(Viewport) private stage: Viewport,
		@inject(UIEventBus) private uiEvent: UIEventBus,
		@inject(ActorMgr) private actorMgr: ActorMgr,
	) {
		super();

		this.uiEvent.on('PlayerNameClicked', () => console.log('yes!'));
	}

	setCurrentPlayer(player: Player) {
		this.playerState.actorId = player.getServerId();
		this.playerState.playerName = 'Player';

		player.on('ControlMovedEvent', this.onPlayerControlMoved);
		player.on('ToggleUsingEvent', this.onToggleUsing);
		player.setTakeControl();

		this.currPlayer = player;
	}

	private onToggleUsing = (event: PlayerMgrEvents['ToggleUsingEvent']) => {
		const rightHand = this.getRightHand();
		this.emit('ToggleUsingEvent', { ...event, actorType: rightHand.actorType });
	};

	private onPlayerControlMoved = (event: PlayerMgrEvents['ControlMovedEvent']) => {
		this.emit('ControlMovedEvent', event);
	};

	isCurrPlayer(player: Player) {
		return this.currPlayer === player;
	}

	getRightHand() {
		if (!this.currPlayer) return;
		return this.actorMgr.getObjectById(this.currPlayer.getRightHand());
	}

	private setControlMoved(deltaMove: Vector2 | false) {
		const player = this.currPlayer;

		if (deltaMove === false) {
			player.controlMove(false);
			return;
		}
		let move: Vector2 = deltaMove;

		const actors = this.actorMgr.getAllActors();

		let overlapX = 0;
		let overlapY = 0;
		for (const actor of actors) {
			if (player === actor) continue;
			if (!actor.boundings) continue;

			const boxA = calcBoundingSATBox(player.vPos.add(deltaMove), player.boundings);
			const boxB = calcBoundingSATBox(actor.vPos, actor.boundings);
			const response = new SAT.Response();

			if (SAT.testPolygonPolygon(boxA.toPolygon(), boxB.toPolygon(), response)) {
				if (response.overlapV.len() <= 0) continue;
				const { x, y } = response.overlapV;
				if (Math.abs(x) > Math.abs(overlapX)) {
					overlapX = x;
				}
				if (Math.abs(y) > Math.abs(overlapY)) {
					overlapY = y;
				}
			}
		}

		if (overlapX !== 0 || overlapY !== 0) {
			move = move.sub(new Vector2(overlapX, overlapY));
		}
		player.controlMove(move);
	}

	private doControlMoveTick() {
		const player = this.currPlayer;
		if (!player) return;

		const moveSpeed = 0.06;

		const upPress = this.inputProvider.keyPress(InputKey.W);
		const downPress = this.inputProvider.keyPress(InputKey.S);
		const leftPress = this.inputProvider.keyPress(InputKey.A);
		const rightPress = this.inputProvider.keyPress(InputKey.D);

		let deltaMove;
		if (upPress && leftPress) {
			deltaMove = new Vector2(-0.707 * moveSpeed, -0.707 * moveSpeed);
		} else if (upPress && rightPress) {
			deltaMove = new Vector2(0.707 * moveSpeed, -0.707 * moveSpeed);
		} else if (downPress && leftPress) {
			deltaMove = new Vector2(-0.707 * moveSpeed, 0.707 * moveSpeed);
		} else if (downPress && rightPress) {
			deltaMove = new Vector2(0.707 * moveSpeed, 0.707 * moveSpeed);
		} else if (downPress) {
			deltaMove = new Vector2(0, moveSpeed);
		} else if (leftPress) {
			deltaMove = new Vector2(-moveSpeed, 0);
		} else if (rightPress) {
			deltaMove = new Vector2(moveSpeed, 0);
		} else if (upPress) {
			deltaMove = new Vector2(0, -moveSpeed);
		}

		if (deltaMove) {
			if (deltaMove.y > 0) {
				player.controlDirection(Direction.FORWARD);
			} else if (deltaMove.y < 0) {
				player.controlDirection(Direction.BACK);
			} else if (deltaMove.x > 0) {
				player.controlDirection(Direction.RIGHT);
			} else if (deltaMove.x < 0) {
				player.controlDirection(Direction.LEFT);
			}
		}

		if (!upPress && !leftPress && !rightPress && !downPress) {
			this.setControlMoved(false);
		} else {
			this.setControlMoved(deltaMove);
		}
	}

	private doUsingRightHand() {
		const player = this.currPlayer;
		if (this.getRightHand()) {
			if (this.inputProvider.cursorPress() || this.inputProvider.keyPress(InputKey.J)) {
				!player.isUsing && player.startUsing();
			} else {
				player.isUsing && player.endUsing();
			}
		}
	}

	private doSetAimTargetTick(tick: number) {
		if (!this.currPlayer) return;
		if (!this.settingAimTarget) return;

		const screenPoint = this.inputProvider.getCursorAt();
		const cursorAt = Vector2.fromArray(this.stage.getWorldPointAt(screenPoint.x, screenPoint.y));
		const rightHand = this.getRightHand();
		if (!rightHand) return;

		const rad = cursorAt.sub(rightHand.vPos).getRad();

		if (tick % 5 === 0) {
			if (this.lastAimTarget === rad) return;
			this.emit('SetAimTargetEvent', {
				rotation: rad,
			});
			this.lastAimTarget = rad;
		}
	}

	private doUpdateDebugInfo() {
		this.playerState.position = this.currPlayer?.vPos;
	}

	private doUpdateViewportCenter() {
		if (!this.currPlayer) return;
		this.stage.moveCenter(this.currPlayer.position.x, this.currPlayer.position.y);
	}

	doFixedUpdateTick(tick: number) {
		this.doControlMoveTick();
		this.doUsingRightHand();
		this.doSetAimTargetTick(tick);
		this.doUpdateDebugInfo();
		this.doUpdateViewportCenter();
	}
}
