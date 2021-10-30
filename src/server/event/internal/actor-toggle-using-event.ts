import { InternalEvent } from '../../../framework/event';

export class ActorToggleUsingEvent extends InternalEvent {
	actorId: number;
	startOrEnd: boolean;
	useTick: number;
}
