import { Vector2 } from '../../server/shared/math';
import { MapStore } from '../../shared/store';
import { HTMLInputProvider, InputKey, InputProvider } from '../input';
import { GameObjectEvent } from '../shared/game-object';
import { Player } from '../object/player';
import { StoreManager } from '../shared/manager';
import { Viewport } from '../viewport';
import { Direction, WalkingState } from '../../shared/actor';
import { DataStore } from '../shared/store';
import { inject, injectable } from 'inversify';
import { GameEvent } from '../event';

@injectable()
export class PlayerManager extends StoreManager {
	constructor(
		@inject(DataStore) private dataStore: DataStore,
		@inject(HTMLInputProvider) private inputProvider: HTMLInputProvider,
		@inject(Viewport) private stage: Viewport,
	) {
		super();
	}
	setCurrentPlayer(player: Player) {
		const key = 'data.player.current';
		if (this.dataStore.has(key)) return;

		this.dataStore.set(key, player);
		player.on(GameEvent.ControlMovedEvent, this.onPlayerControlMoved);
		player.on(GameEvent.SetActorStateEvent, this.onSetActorState);

		player.setTakeControl();
	}
	private onPlayerControlMoved = (position: Vector2, direction: Direction, walking: WalkingState) => {
		this.emit(GameEvent.ControlMovedEvent, position, direction, walking);
	};
	private onSetActorState = (player: Player) => {
		this.emit(GameEvent.SetActorStateEvent, player);
	};
	getCurrentPlayer() {
		const player = this.dataStore.get('data.player.current') as Player;
		return player;
	}
	isCurrentPlayer(player: Player) {
		return this.getCurrentPlayer() === player;
	}
	private doControlMoveTick() {
		const player = this.getCurrentPlayer();
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

		this.stage.moveCenter(player.position.x, player.position.y);
	}
	async doTick(tick: number) {
		this.doControlMoveTick();
	}
}
