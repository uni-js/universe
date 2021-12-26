import { InternalEvent } from '@uni.js/event';

export class ActorDamagedEvent extends InternalEvent {
	actorId: number;
	finalHealth: number;
}
