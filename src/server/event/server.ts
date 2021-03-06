import type { BricksData } from '../land/land';
import type { ContainerData } from '../container/container';
import { ContainerType } from '../container/container-type';
import { BuildingType } from '../building/building-type';

export class LoginedEvent {
	playerActorId: number;
}

export class SetItemEvent {
	contId: number;
	contType: ContainerType;
	itemType: number;
	count: number;
	index: number;
}
export class SetContainerDataEvent {
	contId: number;
	contType: ContainerType;
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
export class AddLandEvent {
	landX: number;
	landY: number;
	bricksData: BricksData;
}
export class RemoveLandEvent {
	landX: number;
	landY: number;
}
export class ActorUpdateAttrsEvent {
	actorId: number;
	updated: any;
}
export class BuildingUpdateAttrsEvent {
	x: number;
	y: number;
	updated: any;
}
export class AddBuildingEvent {
	x: number;
	y: number;
	bType: BuildingType;
	attrs: any;
}
export class RemoveBuildingEvent {
	x: number;
	y: number;
}