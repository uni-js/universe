import type { AttachType } from '../types/actor';

export class ActorRemoveAttachmentEvent {
	actorId: number;
	key: AttachType;
}
