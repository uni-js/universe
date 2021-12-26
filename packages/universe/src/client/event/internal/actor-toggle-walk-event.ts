import { InternalEvent } from '@uni.js/event';
import { Direction, RunningState } from '../../../server/module/actor-module/spec';

export class ActorToggleWalkEvent extends InternalEvent {
	actorId: number;
	running: RunningState;
	direction: Direction;
}
