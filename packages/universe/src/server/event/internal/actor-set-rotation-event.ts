import { InternalEvent } from '@uni.js/event';

export class ActorSetRotationEvent extends InternalEvent {
	actorId: number;
	rotation: number;
}
