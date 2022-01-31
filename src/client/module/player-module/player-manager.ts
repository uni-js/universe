import { Vector2 } from '../../../server/shared/math';
import { HTMLInputProvider, InputKey } from '@uni.js/html-input';
import { ClientSideManager } from '@uni.js/client';
import { Viewport } from '@uni.js/viewport';
import { AttachType, calcBoundingSATBox, Direction, RunningState } from '../../../server/module/actor-module/spec';
import { inject, injectable } from 'inversify';
import { Player } from './player-object';
import { ActorManager } from '../actor-module/actor-manager';
import { UIEventBus } from '@uni.js/ui';
import { PlayerState } from './ui-state';

import SAT from 'sat';
import { Input } from '@uni.js/prediction';

export interface PlayerManagerEvents {
	ControlMovedEvent: {
		input: Input;
		direction: Direction;
		running: RunningState;
	};
	SetAimTargetEvent: {
		rotation: number;
	};
}

@injectable()
export class PlayerManager extends ClientSideManager<PlayerManagerEvents> {
	public settingAimTarget = false;

	private currentPlayer: Player;

	private lastAimTarget: number;

	constructor(
		@inject(PlayerState) private playerState: PlayerState,
		@inject(HTMLInputProvider) private inputProvider: HTMLInputProvider,
		@inject(Viewport) private stage: Viewport,
		@inject(UIEventBus) private uiEvent: UIEventBus,
		@inject(ActorManager) private actorManager: ActorManager,
	) {
		super();

		this.uiEvent.on('PlayerNameClicked', () => console.log('yes!'));
	}

	setCurrentPlayer(player: Player) {
		this.playerState.actorId = player.getServerId();
		this.playerState.playerName = 'Player';

		player.on('ControlMovedEvent', this.onPlayerControlMoved);
		player.setTakeControl();

		this.currentPlayer = player;
	}

	private onPlayerControlMoved = (event: PlayerManagerEvents['ControlMovedEvent']) => {
		this.emit('ControlMovedEvent', event);
	};

	getCurrentPlayer() {
		return this.currentPlayer;
	}

	isCurrentPlayer(player: Player) {
		return this.currentPlayer === player;
	}

	private setControlMoved(deltaMove: Vector2 | false) {
		const player = this.currentPlayer;

		if (deltaMove === false) {
			player.controlMove(false);
			return;
		}
		let move: Vector2 = deltaMove;

		const actors = this.actorManager.getAllActors();

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
		const player = this.currentPlayer;
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
		const player = this.currentPlayer;
		if (!player) return;
		const rightHand = player.getAttachment(AttachType.RIGHT_HAND);

		if (rightHand) {
			const actor = this.actorManager.getObjectById(rightHand.actorId);

			if (this.inputProvider.cursorPress() || this.inputProvider.keyPress(InputKey.J)) {
				!actor.isUsing && actor.startUsing();
			} else {
				actor.isUsing && actor.endUsing();
			}
		}
	}

	private doSetAimTargetTick(tick: number) {
		if (!this.currentPlayer) return;
		if (!this.settingAimTarget) return;

		const screenPoint = this.inputProvider.getCursorAt();
		const cursorAt = Vector2.fromArray(this.stage.getWorldPointAt(screenPoint.x, screenPoint.y));
		const attachment = this.currentPlayer.getAttachment(AttachType.RIGHT_HAND);
		if (!attachment) return;

		const vPos = this.actorManager.getObjectById(attachment.actorId).vPos;

		const rad = cursorAt.sub(vPos).getRad();

		if (tick % 5 === 0) {
			if (this.lastAimTarget === rad) return;
			this.emit('SetAimTargetEvent', {
				rotation: rad,
			});
			this.lastAimTarget = rad;
		}
	}

	private doUpdateDebugInfo() {
		this.playerState.position = this.currentPlayer?.vPos;
	}

	private doUpdateViewportCenter() {
		if (!this.currentPlayer) return;
		this.stage.moveCenter(this.currentPlayer.position.x, this.currentPlayer.position.y);
	}

	doFixedUpdateTick(tick: number) {
		this.doControlMoveTick();
		this.doUsingRightHand();
		this.doSetAimTargetTick(tick);
		this.doUpdateDebugInfo();
		this.doUpdateViewportCenter();
	}
}
