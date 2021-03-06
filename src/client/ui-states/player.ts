import { UIState } from '@uni.js/ui';
import { Vector2 } from '../../server/utils/vector2';

@UIState()
export class PlayerState {
	playerName: string;
	position: Vector2;
	actorId: number;
}
