import { InternalEvent } from '@uni.js/event';

export class LandUsedEvent extends InternalEvent {
	landId: number;
	landPosX: number;
	landPosY: number;
	playerId: number;
}
