import { InternalEvent } from '../../../framework/event';

export class LandNeverUsedEvent extends InternalEvent {
	playerId: number;
	landId: number;
	landPosX: number;
	landPosY: number;
}
