import type { AttachType } from '../types/actor';

export class ActorSetAttachmentEvent {
	actorId: number;
	key: AttachType;
	attachActorId: number;
}
