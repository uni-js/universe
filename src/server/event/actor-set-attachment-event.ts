import type { AttachType } from '../module/actor-module/spec';

export class ActorSetAttachmentEvent {
	actorId: number;
	key: AttachType;
	attachActorId: number;
}
