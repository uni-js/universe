import { InternalEvent } from '@uni.js/event';

export class DespawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
}
