import { Direction, RunningState } from '../../server/actor/spec';
import { ItemType } from '../../server/item';
import { InternalEvent } from '../system/event';

export class ControlMovedEvent extends InternalEvent {
	posX: number;
	posY: number;
	direction: Direction;
	running: RunningState;
}

export class ActorToggleWalkEvent extends InternalEvent {
	actorId: number;
	running: RunningState;
	direction: Direction;
}

export class ActorToggleUsingEvent extends InternalEvent {
	actorId: number;
	startOrEnd: boolean;
}

export class SetShortcutIndexEvent extends InternalEvent {
	containerId: number;
	indexAt: number;
	itemType: ItemType;
}

export class DropItemEvent extends InternalEvent {}

export class onPickingItem extends InternalEvent {}
