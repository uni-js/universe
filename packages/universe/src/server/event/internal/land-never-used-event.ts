import { InternalEvent } from '@uni.js/event';

export class LandNeverUsedEvent extends InternalEvent {
	playerId: number;
	landId: number;
	landPosX: number;
	landPosY: number;
}
