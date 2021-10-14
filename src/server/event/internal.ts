import { InternalEvent } from '../../event/spec';
import { ActorType, Direction, RunningState } from '../actor/spec';
import { ContainerType, ContainerUpdateData } from '../inventory';
import { LandData } from '../land/types';

export class UpdateContainer extends InternalEvent {
	playerId: number;

	containerId: number;
	containerType: ContainerType;
	/**
	 * 更新数据
	 */
	updateData: ContainerUpdateData;
	/**
	 * 更新数据是否是对全部格子进行更新的
	 */
	isFullUpdate: boolean;
}

export class NewPosEvent extends InternalEvent {
	actorId: number;
	posX: number;
	posY: number;
	isControlMoved: boolean;
}

export class NewWalkStateEvent extends InternalEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}

export class ActorDamagedEvent extends InternalEvent {
	actorId: number;
	finalHealth: number;
}

export class ActorSetAttachment extends InternalEvent {
	targetActorId: number;
	key: string;
	actorId: number;
}

export class ActorRemoveAttachment extends InternalEvent {
	targetActorId: number;
	key: string;
}

export class ActorToggleUsingEvent extends InternalEvent {
	actorId: number;
	startOrEnd: boolean;
	useTick: number;
}

export class LandMoveEvent extends InternalEvent {
	actorId: number;
	targetLandPosX: number;
	targetLandPosY: number;
	sourceLandPosX: number;
	sourceLandPosY: number;
}

export class LandDataToPlayerEvent extends InternalEvent {
	playerId: number;
	landId: number;
	landPosX: number;
	landPosY: number;
	landData: LandData;
}

export class LandLoaded extends InternalEvent {
	landPosX: number;
	landPosY: number;
}

export class LandUnloaded extends InternalEvent {
	landId: number;
}

export class LandUsedEvent extends InternalEvent {
	playerId: number;
	landPosX: number;
	landPosY: number;
}

export class LandNeverUsedEvent extends InternalEvent {
	playerId: number;
	landId: number;
	landPosX: number;
	landPosY: number;
}

export class SpawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
	actorType: ActorType;
	ctorOption: any;
}

export class DespawnActorEvent extends InternalEvent {
	fromPlayerId: number;
	actorId: number;
}

export class AddEntityEvent extends InternalEvent {
	entityId: number;
	entity: unknown;
}

export class RemoveEntityEvent extends InternalEvent {
	entityId: number;
	entity: unknown;
}
