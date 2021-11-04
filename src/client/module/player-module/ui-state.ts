import { UIState } from '../../../framework/user-interface/state';

@UIState()
export class PlayerState {
	/**
	 * 玩家名
	 */
	playerName: string;

	/**
	 * 玩家角色id
	 */
	actorId: number;
}
