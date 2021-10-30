import { InternalEvent } from '../../../framework/event';
import { Direction, RunningState } from '../../../server/actor/spec';

export class ActorToggleWalkEvent extends InternalEvent {
	actorId: number;
	running: RunningState;
	direction: Direction;
}
