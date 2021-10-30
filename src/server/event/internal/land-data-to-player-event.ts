import { InternalEvent } from '../../../framework/event';

export class LandDataToPlayerEvent extends InternalEvent {
	playerId: number;
	landId: number;
	landPosX: number;
	landPosY: number;
	landData: any;
}
