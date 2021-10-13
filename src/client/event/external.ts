import { ExternalEvent } from '../../event/spec';
import * as InternalEvents from './internal';

export class ControlMovedEvent extends InternalEvents.ControlMovedEvent {
	isExternal = true;
}

export class ActorToggleWalkEvent extends InternalEvents.ActorToggleWalkEvent {
	isExternal = true;
}

export class LoginEvent extends ExternalEvent {}

export class SetShortcutIndexEvent extends InternalEvents.SetShortcutIndexEvent {
	isExternal = true;
}

export class ActorToggleUsingEvent extends InternalEvents.ActorToggleUsingEvent {
	isExternal = true;
}

export class DropItemEvent extends ExternalEvent {}
