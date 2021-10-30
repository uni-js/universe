import { InternalEvent } from '../../../framework/event';

export class ActorSetAttachmentEvent extends InternalEvent {
	targetActorId: number;
	key: string;
	actorId: number;
}
