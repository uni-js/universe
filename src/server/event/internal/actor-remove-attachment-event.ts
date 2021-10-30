import { InternalEvent } from '../../../framework/event';

export class ActorRemoveAttachmentEvent extends InternalEvent {
	targetActorId: number;
	key: string;
}
