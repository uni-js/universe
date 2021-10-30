import { InternalEvent } from '../../../framework/event';

export class ActorDamagedEvent extends InternalEvent {
	actorId: number;
	finalHealth: number;
}
