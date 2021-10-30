import { InternalEvent } from '../../../framework/event';

export class LandUsedEvent extends InternalEvent {
	landId: number;
	landPosX: number;
	landPosY: number;
	playerId: number;
}
