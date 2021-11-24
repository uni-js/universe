import { InternalEvent } from '../../../framework/event';
import { AttachType } from '../../module/actor-module/spec';

export class ActorRemoveAttachmentEvent extends InternalEvent {
	targetActorId: number;
	key: AttachType;
}
