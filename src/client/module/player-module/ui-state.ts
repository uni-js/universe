import { UIState } from '../../../framework/client-side/user-interface/state';
import { Vector2 } from '../../../server/shared/math';

@UIState()
export class PlayerState {
	playerName: string;
	position: Vector2;
	actorId: number;
}
