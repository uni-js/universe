import { InternalEvent } from '../../../framework/event';

export class LandMoveEvent extends InternalEvent {
	actorId: number;
	targetLandPosX: number;
	targetLandPosY: number;
	sourceLandPosX: number;
	sourceLandPosY: number;
}
