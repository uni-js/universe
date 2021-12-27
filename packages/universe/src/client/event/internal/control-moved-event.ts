import { Input } from '@uni.js/prediction';
import { InternalEvent } from '@uni.js/event';
import { Direction, RunningState } from '../../../server/module/actor-module/spec';

export class ControlMovedEvent extends InternalEvent {
	input: Input;
	direction: Direction;
	running: RunningState;
}
