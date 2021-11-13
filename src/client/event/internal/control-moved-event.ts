import { Input } from '../../../framework/client-side/prediction';
import { InternalEvent } from '../../../framework/event';

export class ControlMovedEvent extends InternalEvent {
	input: Input;
	direction: string;
	running: string;
}
