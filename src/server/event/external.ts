import { ExternalEvent } from '../../event/spec';
import { ActorType, Direction, RunningState } from '../actor/spec';
import { LandData } from '../land/types';
import * as InternalEvents from './internal';

export class ActorNewPosEvent extends InternalEvents.NewPosEvent {
	isExternal = true;
}

export class ActorSetWalkEvent extends ExternalEvent {
	actorId: number;
	direction: Direction;
	running: RunningState;
}

export class LoginedEvent extends ExternalEvent {
	actorId: number;
}

export class AddActorEvent extends ExternalEvent {
	type: ActorType;
	serverId: number;
	ctorOption: any;
}

export class RemoveActorEvent extends ExternalEvent {
	actorId: number;
}

export class AddLandEvent extends ExternalEvent {
	actorId: number;
	landX: number;
	landY: number;
	landData: LandData;
}

export class RemoveLandEvent extends ExternalEvent {
	actorId: number;
	landX: number;
	landY: number;
}

export class ActorSetAttachment extends ExternalEvent {
	targetActorId: number;
	key: string;
	actorId: number;
}

export class ActorRemoveAttachment extends ExternalEvent {
	targetActorId: number;
	key: string;
}

export class ActorToggleUsing extends ExternalEvent {
	actorId: number;
	startOrEnd: boolean;
}

export class UpdateContainer extends InternalEvents.UpdateContainer {
	isExternal = true;
}

export class ActorDamagedEvent extends InternalEvents.ActorDamagedEvent {
	isExternal = true;
}
