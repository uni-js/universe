import { InternalEvent } from '../../../framework/event';

export class NewPosEvent extends InternalEvent {
	actorId: number;
	posX: number;
	posY: number;
	processedInputSeq: number;
}
