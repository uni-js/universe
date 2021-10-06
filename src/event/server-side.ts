import { LandData } from '../server/land/types';
import { ActorType, Direction, RunningState } from '../server/actor/spec';
import { ContainerType, ContainerUpdateData } from '../server/inventory';
import { RemoteEvent } from './event';

export class ActorNewPosEvent extends RemoteEvent {
	constructor(public actorId: number, public x: number, public y: number) {
		super();
	}
}

export class ActorSetWalkEvent extends RemoteEvent {
	constructor(public actorId: number, public direction: Direction, public running: RunningState) {
		super();
	}
}

export class LoginedEvent extends RemoteEvent {
	constructor(public actorId: number) {
		super();
	}
}

export class AddActorEvent extends RemoteEvent {
	constructor(public type: ActorType, public serverId: number, public ctorOption: any) {
		super();
	}
}

export class RemoveActorEvent extends RemoteEvent {
	constructor(public actorId: number) {
		super();
	}
}

export class AddLandEvent extends RemoteEvent {
	constructor(public actorId: number, public landX: number, public landY: number, public landData: LandData) {
		super();
	}
}

export class RemoveLandEvent extends RemoteEvent {
	constructor(public actorId: number, public landX: number, public landY: number) {
		super();
	}
}

export class ActorSetAttachment extends RemoteEvent {
	constructor(public targetActorId: number, public key: string, public actorId: number) {
		super();
	}
}

export class ActorRemoveAttachment extends RemoteEvent {
	constructor(public targetActorId: number, public key: string) {
		super();
	}
}

export class ActorToggleUsing extends RemoteEvent {
	constructor(public actorId: number, public startOrEnd: boolean) {
		super();
	}
}

export class UpdateContainer extends RemoteEvent {
	/**
	 * @param updateData 更新数据
	 * @param isFullUpdate 更新数据是否是对全部格子进行更新的
	 */
	constructor(
		public containerId: number,
		public containerType: ContainerType,
		public updateData: ContainerUpdateData,
		public isFullUpdate: boolean,
	) {
		super();
	}
}
