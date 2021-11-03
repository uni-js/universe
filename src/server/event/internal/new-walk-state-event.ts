import { InternalEvent } from '../../../framework/event';
import { Direction, RunningState } from '../../module/actor-module/spec';

export class NewWalkStateEvent extends InternalEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}
