import { InternalEvent } from '../../../framework/event';

export class ControlMovedEvent extends InternalEvent {
	posX: number;
	posY: number;
	direction: string;
	running: string;
}
