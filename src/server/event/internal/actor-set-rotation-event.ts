import { InternalEvent } from '../../../framework/event';

export class ActorSetRotationEvent extends InternalEvent {
	actorId: number;
	rotation: number;
}
