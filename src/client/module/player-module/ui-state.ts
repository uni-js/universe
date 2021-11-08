import { UIState } from '../../../framework/client-side/user-interface/state';

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
