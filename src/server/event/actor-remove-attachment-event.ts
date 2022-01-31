import type { AttachType } from '../module/actor-module/spec';

export class ActorRemoveAttachmentEvent {
	actorId: number;
	key: AttachType;
}
