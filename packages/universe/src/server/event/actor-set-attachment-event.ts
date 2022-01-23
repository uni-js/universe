import type { AttachType } from "../module/actor-module/spec";

export class ActorSetAttachmentEvent {
    targetActorId: number;
	key: AttachType;
	actorId: number;
}
