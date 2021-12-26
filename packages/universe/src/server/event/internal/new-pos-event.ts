import { InternalEvent } from '@uni.js/event';

export class NewPosEvent extends InternalEvent {
	actorId: number;
	posX: number;
	posY: number;
	motionX: number;
	motionY: number;
	processedInputSeq: number;
}
