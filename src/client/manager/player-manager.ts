import { Vector2 } from '../../server/shared/math';
import { HTMLInputProvider, InputKey } from '../input';
import { StoreManager } from '../shared/manager';
import { Viewport } from '../viewport';
import { Direction, WalkingState } from '../../shared/actor';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';
import { ICollection, injectCollection } from '../../shared/database/memory';
import { PlayerInfo, UIEventBus } from '../shared/store';
import { Player } from '../object/player';

@injectable()
export class PlayerManager extends StoreManager {
	private currentPlayer: Player;
	private playerInfo: PlayerInfo;

	constructor(
		@injectCollection(PlayerInfo) private gameInfoList: ICollection<PlayerInfo>,
		@inject(HTMLInputProvider) private inputProvider: HTMLInputProvider,
		@inject(Viewport) private stage: Viewport,
		@inject(UIEventBus) private uiEvent: UIEventBus,
	) {
		super();

		this.uiEvent.on('PlayerNameClicked', () => console.log('yes!'));

		const playerInfo = new PlayerInfo();

		this.playerInfo = playerInfo;
		this.gameInfoList.insertOne(playerInfo);
	}
	setCurrentPlayer(player: Player) {
		this.playerInfo.playerActorId = player.getObjectId();
		this.playerInfo.playerName = 'Player';
		this.gameInfoList.update(this.playerInfo);

		player.on(GameEvent.ControlMovedEvent, this.onPlayerControlMoved);
		player.on(GameEvent.SetActorStateEvent, this.onSetActorState);

		player.setTakeControl();

		this.currentPlayer = player;
	}
	private onPlayerControlMoved = (position: Vector2, direction: Direction, walking: WalkingState) => {
		this.emit(GameEvent.ControlMovedEvent, position, direction, walking);
	};
	private onSetActorState = (player: Player) => {
		this.emit(GameEvent.SetActorStateEvent, player);
	};
	getCurrentPlayer() {
		return this.currentPlayer;
	}
	isCurrentPlayer(player: Player) {
		return this.currentPlayer === player;
	}
	private doControlMoveTick() {
		const player = this.currentPlayer;
		if (!player) return;

		const moveSpeed = 0.06;

		const upPress = this.inputProvider.keyPress(InputKey.W);
		const downPress = this.inputProvider.keyPress(InputKey.S);
		const leftPress = this.inputProvider.keyPress(InputKey.A);
		const rightPress = this.inputProvider.keyPress(InputKey.D);

		if (upPress && leftPress) {
			player.controlMove(new Vector2(-0.707 * moveSpeed, -0.707 * moveSpeed));
		} else if (upPress && rightPress) {
			player.controlMove(new Vector2(0.707 * moveSpeed, -0.707 * moveSpeed));
		} else if (downPress && leftPress) {
			player.controlMove(new Vector2(-0.707 * moveSpeed, 0.707 * moveSpeed));
		} else if (downPress && rightPress) {
			player.controlMove(new Vector2(0.707 * moveSpeed, 0.707 * moveSpeed));
		} else if (downPress) {
			player.controlMove(new Vector2(0, moveSpeed));
		} else if (leftPress) {
			player.controlMove(new Vector2(-moveSpeed, 0));
		} else if (rightPress) {
			player.controlMove(new Vector2(moveSpeed, 0));
		} else if (upPress) {
			player.controlMove(new Vector2(0, -moveSpeed));
		}

		if (!upPress && !leftPress && !rightPress && !downPress) {
			player.controlMove(false);
		}

		this.stage.moveCenter(player.position.x, player.position.y);
	}
	async doTick(tick: number) {
		this.doControlMoveTick();
	}
}
