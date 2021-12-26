import { InternalEvent } from '@uni.js/event';
import { AttachType } from '../../module/actor-module/spec';

export class ActorSetAttachmentEvent extends InternalEvent {
	targetActorId: number;
	key: AttachType;
	actorId: number;
}
