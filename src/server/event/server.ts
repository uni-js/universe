import type { LandData } from "../land/land";
import type { ContainerData } from "../container/container"

export class LoginedEvent {
    playerActorId: number;
}

export class ActorAttachEvent {
    actorId: number;
    attachTo: number;
}
export class SetItemEvent {
    contId: number;
    itemType: number;
    count: number;
}
export class SetContainerDataEvent {
    contId: number;
    data: ContainerData;
}
export class MoveActorEvent {
    actorId: number;
    x: number;
    y: number;
    inputSeq: number;
}
export class AddActorEvent {
    actorId: number;
    actorType: number;
    x: number;
    y: number;
    attrs: any;
}
export class RemoveActorEvent {
    actorId: number;
}
export class AddLandEvent{
    landX: number;
    landY: number;
    landData: LandData
}
export class RemoveLandEvent{
    landX: number;
    landY: number;
}
export class UpdateAttrsEvent{
    actorId: number;
    updated: any;
}
