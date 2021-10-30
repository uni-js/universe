import { InternalEvent } from '../../../framework/event';

export class LandUnloadedEvent extends InternalEvent {
	landId: number;
}
