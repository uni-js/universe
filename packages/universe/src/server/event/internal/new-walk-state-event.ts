import { InternalEvent } from '@uni.js/event';
import { Direction, RunningState } from '../../module/actor-module/spec';

export class NewWalkStateEvent extends InternalEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}
