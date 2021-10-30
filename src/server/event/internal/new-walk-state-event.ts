import { InternalEvent } from '../../../framework/event';
import { Direction, RunningState } from '../../actor/spec';

export class NewWalkStateEvent extends InternalEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}
