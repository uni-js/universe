import { Input } from '../../../framework/client-side/prediction';
import { InternalEvent } from '../../../framework/event';
import { Direction, RunningState } from '../../../server/module/actor-module/spec';

export class ControlMovedEvent extends InternalEvent {
	input: Input;
	direction: Direction;
	running: RunningState;
}
