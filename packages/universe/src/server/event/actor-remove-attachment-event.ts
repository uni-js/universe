import type { AttachType } from "../module/actor-module/spec";

export class ActorRemoveAttachmentEvent {
    targetActorId: number;
	key: AttachType;
}
