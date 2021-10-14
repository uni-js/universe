import { ExternalEvent } from '../../event/spec';
import { Direction, RunningState } from '../actor/spec';
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

export class AddActorEvent extends InternalEvents.SpawnActorEvent {
	isExternal = true;
}

export class RemoveActorEvent extends ExternalEvent {
	actorId: number;
}

export class AddLandEvent extends InternalEvents.LandDataToPlayerEvent {
	isExternal = true;
}

export class RemoveLandEvent extends InternalEvents.LandNeverUsedEvent {
	isExternal = true;
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
