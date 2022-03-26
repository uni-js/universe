import type { Input } from '@uni.js/prediction';
import type { Direction, RunningState } from '../../server/types/actor';

export class ControlMovedEvent {
	input: Input;
	direction: Direction;
	running: RunningState;
}
