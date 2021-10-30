import { InternalEvent } from '../../../framework/event';

export class DespawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
}
