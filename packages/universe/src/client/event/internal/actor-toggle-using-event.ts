import { InternalEvent } from '@uni.js/event';

export class ActorToggleUsingEvent extends InternalEvent {
	actorId: number;
	startOrEnd: boolean;
}
